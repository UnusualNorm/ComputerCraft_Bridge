-- TODO: Clean up variable names

Socket = http.websocket(ConnectionUrl)
Routines = {}
RemoteCallbacks = {}
LocalCallbacks = {}

local remoteCallbackResponses = {}

function RemoteCallback(remoteId)
    return function(...)
        local args = { ... }

        local requestId = #remoteCallbackResponses + 1
        remoteCallbackResponses[requestId] = "unknown"

        local requestArgs, requestCast = SerializeArray(args)
        Socket.send(
            textutils.serialiseJSON({
                'callback_request',
                requestId,
                remoteId,
                requestArgs,
                requestCast,
            })
        )

        local responded = false
        local response = {}
        repeat
            if remoteCallbackResponses[requestId] ~= "unknown" then
                responded = true
                response = remoteCallbackResponses[requestId]
                remoteCallbackResponses[requestId] = nil
            else
                coroutine.yield()
            end
        until responded

        if type(response) == "table" then
            return table.unpack(response)
        else
            error(response)
        end
    end
end

function CreateRemoteCallback(remoteId)
    local remoteCallback = RemoteCallback(remoteId)
    RemoteCallbacks[remoteId] = remoteCallback
    return remoteCallback
end

function CreateLocalCallback(callback)
    local localId = #LocalCallbacks + 1
    LocalCallbacks[localId] = callback
    Socket.send(
        textutils.serialiseJSON({
            'callback_create',
            localId,
        })
    )
    return localId
end

-- GENERATED CODE BELOW

local function isArray(value)
    return type(value) == "table" and next(value) ~= nil
end

local function objectKeys(obj)
    local result = {}
    local len = 0
    for key in pairs(obj) do
        len = len + 1
        result[len] = key
    end
    return result
end

local function arrayMap(array, callbackfn)
    local result = {}
    for i = 1, #array do
        result[i] = callbackfn(array[i], i - 1, array)
    end
    return result
end

function SerializeValue(value)
    local out = nil
    local cast = false
    if type(value) == "string"
        or type(value) == "boolean"
        or type(value) == "number"
        or type(value) == 'nil' then
        out = value
        cast = false
    elseif type(value) == "table" then
        if isArray(value) then
            out, cast = SerializeArray(value)
        else
            out, cast = SerializeObject(value)
        end
    elseif type(value) == "function" then
        out = CreateLocalCallback(value)
        cast = true
    end
    return out, cast
end

function SerializeObject(obj)
    local out = {}
    local cast = {}
    local keys = objectKeys(obj)
    for _, key in ipairs(keys) do
        local valueOut, valueCast = SerializeValue(obj[key])
        out[key] = valueOut
        cast[key] = valueCast
    end
    return out, cast
end

function SerializeArray(array)
    local out = {}
    local cast = {}
    do
        local i = 0
        while i < #array do
            local valueOut, valueCast = SerializeValue(array[i + 1])
            out[i + 1] = valueOut
            cast[i + 1] = valueCast
            i = i + 1
        end
    end

    if next(out) == nil then
        out = textutils.empty_json_array
        cast = textutils.empty_json_array
    end

    return out, cast
end

function UnserializeValue(value, cast)
    local out
    if cast == true and type(value) == "number" then
        out = CreateRemoteCallback(value)
    elseif value ~= nil and type(value) == "table" and type(cast) == "table" then
        local temp1
        if isArray(value) and isArray(cast) then
            temp1 = UnserializeArray(value, cast)
        else
            local temp0
            if not isArray(value) and not isArray(cast) then
                temp0 = UnserializeObject(value, cast)
            else
                temp0 = value
            end
            temp1 = temp0
        end
        out = temp1
    else
        out = value
    end
    return out
end

function UnserializeObject(obj, cast)
    local out = {}
    local keys = objectKeys(obj)
    for key in pairs(keys) do
        local objValue = obj[key]
        local castValue = cast[key]
        if castValue == nil then
            castValue = false
        end
        out[key] = UnserializeValue(objValue, castValue)
    end
    return out
end

function UnserializeArray(array, cast)
    return arrayMap(
        array,
        function(value, i)
            local castIndex = cast[i + 1]
            if castIndex == nil then
                castIndex = false
            end
            return UnserializeValue(value, castIndex)
        end
    )
end

-- GENERATED CODE ABOVE

function createRoutine(fn)
    local co = coroutine.create(fn)
    table.insert(Routines, co)
    return co
end

function MainLoop()
    while true do
        local event = { os.pullEventRaw() }
        if event[1] == "websocket_closed" and event[2] == ConnectionUrl then
            os.queueEvent("websocket_closed", ConnectionUrl)
            break
        elseif event[1] == "websocket_message" and event[2] == ConnectionUrl then
            local message = textutils.unserialiseJSON(event[3])
            if message[1] == "callback_request" then
                local requestId = message[2]
                local callbackId = message[3]
                local request = message[4]
                local cast = message[5]
                local args = UnserializeArray(request, cast)
                local callback = LocalCallbacks[callbackId]
                if callback == nil then
                    Socket.send(
                        textutils.serialiseJSON({
                            'callback_reject',
                            requestId,
                            "Callback not found",
                        })
                    )
                    return
                end
                createRoutine(function()
                    local output = { pcall(callback, table.unpack(args)) }
                    local success = table.remove(output, 1)
                    if success then
                        local responseArgs, responseCast = SerializeArray(output)
                        Socket.send(
                            textutils.serialiseJSON({
                                'callback_resolve',
                                requestId,
                                responseArgs,
                                responseCast,
                            })
                        )
                    else
                        local response = output[1]
                        Socket.send(
                            textutils.serialiseJSON({
                                'callback_reject',
                                requestId,
                                response,
                            })
                        )
                    end
                end)
            elseif message[1] == "callback_resolve" then
                local requestId = message[2]
                local response = message[3]
                local cast = message[4]
                local args = UnserializeArray(response, cast)
                remoteCallbackResponses[requestId] = args
            elseif message[1] == "callback_reject" then
                local requestId = message[2]
                local response = message[3]
                remoteCallbackResponses[requestId] = response
            elseif message[1] == "callback_create" then
                local callbackId = message[2]
                CreateRemoteCallback(callbackId)
            elseif message[1] == "eval_request" then
                local requestId = message[2]
                local code = message[3]
                local rawArgs = message[4]
                local argsCast = message[5]
                local args = UnserializeArray(rawArgs, argsCast)
                local globalNames = {}
                setmetatable(globalNames, { __index = _G })
                globalNames.arg = args
                local fn, err = load(code, nil, 't', globalNames)
                if fn then
                    createRoutine(function()
                        local rawOutput = { pcall(fn) }
                        local success = table.remove(rawOutput, 1)
                        local output, outputCast = SerializeArray(rawOutput)

                        if success then
                            Socket.send(
                                textutils.serialiseJSON({
                                    'eval_resolve',
                                    requestId,
                                    output,
                                    outputCast,
                                })
                            )
                        else
                            local err = rawOutput[1]
                            Socket.send(
                                textutils.serialiseJSON({
                                    'eval_reject',
                                    requestId,
                                    pcallErr,
                                })
                            )
                        end
                    end)
                else
                    Socket.send(
                        textutils.serialiseJSON({
                            'eval_reject',
                            requestId,
                            err,
                        })
                    )
                end
            end
        end
    end
end

parallel.waitForAny(MainLoop, function()
    local tFilters = {}
    local eventData = { n = 0 }
    while true do
        for n = 1, #Routines do
            local r = Routines[n]
            if r then
                if tFilters[r] == nil or tFilters[r] == eventData[1] or eventData[1] == "terminate" then
                    local ok, param = coroutine.resume(r, table.unpack(eventData, 1, eventData.n))
                    if not ok then
                        error(param, 0)
                    else
                        tFilters[r] = param
                    end
                    if coroutine.status(r) == "dead" then
                        Routines[n] = nil
                    end
                end
            end
        end
        for n = 1, #Routines do
            local r = Routines[n]
            if r and coroutine.status(r) == "dead" then
                Routines[n] = nil
            end
        end
        eventData = table.pack(os.pullEventRaw())
    end
end)