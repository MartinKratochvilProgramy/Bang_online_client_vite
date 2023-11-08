import React from 'react'
import { Button } from './Button'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectUsername } from '../features/usernameSlice'
import { setCurrentRoom } from '../features/currentRoomSlice'
import { type Room } from '../types/room'

import { socket } from '../socket'

interface Props {
  room: Room
}

export const RoomInfo: React.FC<Props> = ({ room }) => {
  const dispatch = useAppDispatch()
  const username = useAppSelector(selectUsername)

  const joinRoom = () => {
    socket.emit('join_room', { currentRoom: room.name, username })
    dispatch(setCurrentRoom(room.name))
  }

  return (
    <div
      className="bg-beige min-h-[55px] w-[280px] sm:w-[380px] xs:w-[420px]
        flex justify-between items-center space-x-2 rounded p-3 text-black font-rye
        text-sm leading-snug uppercase hover:shadow-xl
        focus:shadow-lg focus:outline-none focus:ring-0
        active:bg-red-100 active:shadow-lg
        transition duration-150 ease-in-out dark:hover:bg-darkBeige"
      key={room.name}
      id={room.name}
    >
      <div className='flex space-x-2 text-xs sm:text-lg items-center'>
        <div className='break-all'>
          {room.name}
        </div>
        <div className='text-gray-700'>
          {room.numOfPlayers}/6
        </div>
      </div>
      {(!room.gameActive && room.numOfPlayers < 6) && <Button onClick={joinRoom} value={'Join'} size={1.5} />}
      {room.gameActive && <p className='text-gray-700'>In progress</p>}
      {(room.numOfPlayers >= 6 && !room.gameActive) && <p className='text-gray-700'>Room full</p>}

    </div>
  )
}
