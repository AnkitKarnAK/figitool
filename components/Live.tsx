import React, { useCallback } from 'react'
import LiveCursors from './cursor/LiveCursors'
import { useMyPresence, useOthers } from '@/liveblocks.config'
import { log } from 'console';

const Live = () => {
    const others = useOthers();
    const [{ cursor }, updateMyPresence] = useMyPresence() as any;

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        e.preventDefault()

        const x = e.clientX - e.currentTarget.getBoundingClientRect().x;
        const y = e.clientY - e.currentTarget.getBoundingClientRect().y;

        updateMyPresence({ cursor: { x, y } })
    }, [])

    const handlePointerLeave = useCallback((e: React.PointerEvent) => {
        e.preventDefault()

        updateMyPresence({ cursor: null, message: null })
    }, [])

    const handlePointerDown = useCallback((e: React.PointerEvent) => {

        const x = e.clientX - e.currentTarget.getBoundingClientRect().x;
        const y = e.clientY - e.currentTarget.getBoundingClientRect().y;

        updateMyPresence({ cursor: { x, y } })
    }, [])


    return (
        <div onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} onPointerDown={handlePointerDown}
            className="h-[100vh] w-full flex justify-center items-center text-center border-2 border-green-500"
        >
            <h1 className="text-5xl text-white">FigiTools</h1>
            <LiveCursors others={others} />
        </div>
    )
}

export default Live