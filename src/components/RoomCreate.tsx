import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setIsAdminTrue } from '../features/isAdminSlice'
import { selectUsername } from '../features/usernameSlice'
import { selectRooms } from '../features/roomsSlice'
import { setCurrentRoom } from '../features/currentRoomSlice'
import { Button } from './Button'

import { socket } from '../socket'

export const RoomCreate = () => {
  const [roomInput, setRoomInput] = useState('')

  const dispatch = useAppDispatch()
  const username = useAppSelector(selectUsername)
  const rooms = useAppSelector(selectRooms)

  function createRoom (roomName: string) {
    // don't allow already existing room to be created
    dispatch(setIsAdminTrue())
    for (const room of rooms) {
      if (room.name === roomName) {
        return
      }
    }

    socket.emit('create_room', roomName)

    // join room after create
    socket.emit('join_room', { currentRoom: roomName, username })
    dispatch(setCurrentRoom(roomName))
  }

  function handleSubmit () {
    if (roomInput === '') return
    createRoom(roomInput)
    setRoomInput('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='my-8'>
      <label className="text-outline font-rye text-4xl sm:text-5xl text-white my-6">
        Create a new room
      </label>
      <br />
      <input
        className='shadow appearance-none h-[43px] font-rye text-xl rounded bg-beige mt-1 mb-2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
        id='room-name-input'
        placeholder="Room name..."
        onChange={(e) => { setRoomInput(e.target.value) }}
        maxLength={21}
        value={roomInput}
      />
      <br />
      <Button
        onClick={handleSubmit}
        value={'Create room'}
        size={2}
      />
    </form>

  )
}
