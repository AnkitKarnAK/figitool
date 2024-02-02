import React, { useCallback, useEffect, useState } from 'react'
import LiveCursors from './cursor/LiveCursors'
import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from '@/liveblocks.config'
import { log } from 'console';
import CursorChat from './cursor/CursorChat';
import { CursorMode, CursorState, Reaction, ReactionEvent } from '@/types/type';
import ReactionSelector from './reaction/ReactionButton';
import FlyingReaction from './reaction/FlyingReaction';
import useInterval from '@/hooks/useInterval';

const Live = () => {
    const others = useOthers();
    const [{ cursor }, updateMyPresence] = useMyPresence() as any;
    const broadcast = useBroadcastEvent();

    const [cursorState, setCursorState] = useState<CursorState>({
        mode: CursorMode.Hidden,
    });
    const [reactions, setReactions] = useState<Reaction[]>([])

    // set the reaction of the cursor
    const setReaction = useCallback((reaction: string) => {
        setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
    }, []);

    // listens to mouse move events to change the cursor state & position
    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        e.preventDefault()

        // if cursor is not in reaction selector mode, update the cursor position
        if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {

            const x = e.clientX - e.currentTarget.getBoundingClientRect().x;
            const y = e.clientY - e.currentTarget.getBoundingClientRect().y;

            // broadcast the cursor position to other users
            updateMyPresence({ cursor: { x, y } })
        }
    }, [])

    // hides the cursor when the mouse leaves the canvas
    const handlePointerLeave = useCallback((e: React.PointerEvent) => {
        setCursorState({ mode: CursorMode.Hidden });

        updateMyPresence({ cursor: null, message: null })
    }, [])

    // shows the cursor when the mouse enters the canvas
    const handlePointerDown = useCallback((e: React.PointerEvent) => {

        const x = e.clientX - e.currentTarget.getBoundingClientRect().x;
        const y = e.clientY - e.currentTarget.getBoundingClientRect().y;

        updateMyPresence({ cursor: { x, y } })

        // if cursor is in reaction mode, set isPressed to true
        setCursorState((state: CursorState) =>
            cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
        );
    }, [cursorState.mode, setCursorState])

    // hide the cursor when the mouse is up
    const handlePointerUp = useCallback(() => {
        setCursorState((state: CursorState) =>
            cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state
        );
    }, [cursorState.mode, setCursorState]);

    // Broadcast the reaction to other users (every 100ms)
    useInterval(() => {
        if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
            // concat all the reactions created on mouse click
            setReactions((reactions) =>
                reactions.concat([
                    {
                        point: { x: cursor.x, y: cursor.y },
                        value: cursorState.reaction,
                        timestamp: Date.now(),
                    },
                ])
            );

            // Broadcast the reaction to other users
            broadcast({
                x: cursor.x,
                y: cursor.y,
                value: cursorState.reaction,
            });
        }
    }, 100);

    // Listen to reaction events from other users
    useEventListener((eventData) => {
        const event = eventData.event as ReactionEvent;

        setReactions((reactions) =>
            reactions.concat([
                {
                    point: { x: event.x, y: event.y },
                    value: event.value,
                    timestamp: Date.now(),
                },
            ])
        );
    });

    // Remove reactions that are not visible anymore (every 1 sec)
    useInterval(() => {
        setReactions((reactions) => reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000));
    }, 1000);

    useEffect(() => {
        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key === "/") {
                setCursorState({ mode: CursorMode.Chat, previousMessage: null, message: "" })
            } else if (e.key === "Escape") {
                updateMyPresence({ message: "" })
                setCursorState({ mode: CursorMode.Hidden })
            } else if (e.key === "e") {
                setCursorState({ mode: CursorMode.ReactionSelector })
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
        <div onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}
            className="h-[100vh] w-full flex justify-center items-center text-center border-2 border-green-500"
        >
            <h1 className="text-5xl text-white">FigiTools</h1>

            {reactions.map((reaction) => (
                <FlyingReaction
                    key={reaction.timestamp.toString()}
                    x={reaction.point.x}
                    y={reaction.point.y}
                    timestamp={reaction.timestamp}
                    value={reaction.value}
                />
            ))}

            {/* If cursor is in chat mode, show the chat cursor */}
            {cursor &&
                <CursorChat
                    cursor={cursor}
                    cursorState={cursorState}
                    setCursorState={setCursorState}
                    updateMyPresence={updateMyPresence}
                />}

            {/* If cursor is in reaction selector mode, show the reaction selector */}
            {cursorState.mode === CursorMode.ReactionSelector && (
                <ReactionSelector
                    setReaction={(reaction) => {
                        setReaction(reaction)
                    }}

                />
            )
            }

            <LiveCursors others={others} />
        </div>
    )
}

export default Live