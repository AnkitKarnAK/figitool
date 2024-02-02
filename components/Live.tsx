import React, { useCallback, useEffect, useState } from 'react'
import LiveCursors from './cursor/LiveCursors'
import { useMyPresence, useOthers } from '@/liveblocks.config'
import { log } from 'console';
import CursorChat from './cursor/CursorChat';
import { CursorMode } from '@/types/type';

const Live = () => {
    const others = useOthers();
    const [{ cursor }, updateMyPresence] = useMyPresence() as any;
    const [cursorState, setCursorState] = useState({
        mode: CursorMode.Hidden,
    });

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        e.preventDefault()

        const x = e.clientX - e.currentTarget.getBoundingClientRect().x;
        const y = e.clientY - e.currentTarget.getBoundingClientRect().y;

        updateMyPresence({ cursor: { x, y } })
    }, [])

    const handlePointerLeave = useCallback((e: React.PointerEvent) => {
        setCursorState({ mode: CursorMode.Hidden });

        updateMyPresence({ cursor: null, message: null })
    }, [])

    const handlePointerDown = useCallback((e: React.PointerEvent) => {

        const x = e.clientX - e.currentTarget.getBoundingClientRect().x;
        const y = e.clientY - e.currentTarget.getBoundingClientRect().y;

        updateMyPresence({ cursor: { x, y } })
    }, [])

    useEffect(() => {
        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key === "/") {
                setCursorState({ mode: CursorMode.Chat, previousMessage: null, message: "" })
            } else if (e.key === "Escape") {
                updateMyPresence({ message: "" })
                setCursorState({ mode: CursorMode.Hidden })
            }
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "/") {
                e.preventDefault()

            }
        }

        window.addEventListener('keyup', onKeyUp)
        window.addEventListener('keydown', onKeyDown)

        return () => {
            window.removeEventListener('keyup', onKeyUp)
            window.removeEventListener('keydown', onKeyDown)
        }

    }, [updateMyPresence])


    return (
        <div onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} onPointerDown={handlePointerDown}
            className="h-[100vh] w-full flex justify-center items-center text-center border-2 border-green-500"
        >
            <h1 className="text-5xl text-white">FigiTools</h1>

            {cursor &&
                <CursorChat
                    cursor={cursor}
                    cursorState={cursorState}
                    setCursorState={setCursorState}
                    updateMyPresence={updateMyPresence}
                />}
            <LiveCursors others={others} />
        </div>
    )
}

export default Live