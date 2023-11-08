import React from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectCurrentRoom, setCurrentRoom } from '../features/currentRoomSlice'
import { selectIsAdmin, setIsAdminFalse } from '../features/isAdminSlice'
import { selectPlayers } from '../features/playersSlice'
import { setGameStartedFalse } from '../features/gameStartedSlice'
import { type Player } from '../types/player'
import { Button } from './Button'
import { Chat } from './Chat'

import { socket } from '../socket'
import { selectUsername } from '../features/usernameSlice'

export const Room = () => {
  const username = useAppSelector(selectUsername)
  const players = useAppSelector(selectPlayers)
  const currentRoom = useAppSelector(selectCurrentRoom)
  const isAdmin = useAppSelector(selectIsAdmin)

  const dispatch = useAppDispatch()

  function startGame () {
    const currentPlayers = players.map((player: Player) => {
      return player.username
    })
    socket.emit('start_game', { players: currentPlayers, currentRoom })
  }

  function leaveRoom () {
    socket.emit('leave_room', { username, currentRoom })
    dispatch(setIsAdminFalse())
    dispatch(setGameStartedFalse())
    dispatch(setCurrentRoom(null))
  }

  return (
    <div>
      <div className='text-outline font-rye break-all text-4xl sm:text-6xl text-white mt-6 sm:mt-12 mb-4 sm:mb-6'>
        {currentRoom}
      </div>
      <Button size={1.8} value={'DISCONNECT'} onClick={leaveRoom} />

      <div className='text-outline font-rye text-4xl sm:text-6xl text-white my-2 mt-8 sm:mt-16'>
        Players ({players.length}/6):
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-1 space-x-2 flex-col justify-center items-center'>
        {players.map((player: Player) => {
          return (
            <div key={player.username} className='text-outline font-rye text-4xl text-white my-2'>{player.username}</div>
          )
        })}
      </div>

      {(isAdmin && (players.length === 2 || (players.length >= 4 && players.length <= 6))) &&
        <Button onClick={startGame} value={'START GAME'} size={2} />
      }

      <div className='flex justify-center mt-8'>
        <Chat />
      </div>
    </div>
  )
}
