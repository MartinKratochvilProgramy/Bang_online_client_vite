import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setActiveCard } from '../features/activeCardSlice'
import { selectAllPlayersInfo } from '../features/allPlayersInfoSlice'
import { selectCharacterUsable, setCharacterUsableFalse } from '../features/characterUsableSlice'
import { selectCurrentPlayer } from '../features/currentPlayerSlice'
import { selectCurrentRoom } from '../features/currentRoomSlice'
import { setDeckActiveFalse } from '../features/deckActiveSlice'
import { selectDiscarding, setDiscardingFalse, setDiscardingTrue } from '../features/discardingSlice'
import { selectIsLosingHealth, setIsLosingHealthFalse } from '../features/isLosingHealthSlice'
import { selectMyHand, setMyHand, setMyHandNotPlayable } from '../features/myHandSlice'
import { selectMyHealth } from '../features/myHealthSlice'
import { selectNextTurn } from '../features/nextTurnSlice'
import { setSelectCardTargetFalse } from '../features/selectCardTargetSlice'
import { selectSelectPlayerTarget, setSelectPlayerTargetFalse } from '../features/selectPlayerTargetSlice'
import { selectUsername } from '../features/usernameSlice'
import { type CardI } from '../types/card'
import getCharacterDescription from '../utils/getCharacterDescription'
import getRoleDescription from '../utils/getRoleDescription'
import { Card } from './Card'
import { selectEmporioState } from '../features/emporioStateSlice'
import { Button } from './Button'
import { selectMyDrawChoice } from '../features/myDrawChoice'
import { CardOnTable } from './CardOnTable'
import { selectCharacter } from '../features/characterSlice'

import { socket } from '../socket'
import { selectActionMessage, setActionMessage } from '../features/actionMessageSlice'

interface Props {
  predictUseCard: (cardName: string, cardDigit: number, cardType: string) => void
  confirmCardTarget: (cardName: string, cardDigit: number, cardType: string, oponentName: string) => void
}

export const PlayerTable: React.FC<Props> = ({ predictUseCard, confirmCardTarget }) => {
  const [role, setRole] = useState('')
  const [table, setTable] = useState<CardI[]>([])

  const username = useAppSelector(selectUsername)
  const currentRoom = useAppSelector(selectCurrentRoom)
  const character = useAppSelector(selectCharacter)
  const myHand = useAppSelector(selectMyHand)
  const myHealth = useAppSelector(selectMyHealth)
  const characterUsable = useAppSelector(selectCharacterUsable)
  const currentPlayer = useAppSelector(selectCurrentPlayer)
  const nextTurn = useAppSelector(selectNextTurn)
  const allPlayersInfo = useAppSelector(selectAllPlayersInfo)
  const emporioState = useAppSelector(selectEmporioState)
  const myDrawChoice = useAppSelector(selectMyDrawChoice)
  const selectPlayerTarget = useAppSelector(selectSelectPlayerTarget)
  const discarding = useAppSelector(selectDiscarding)
  const isLosingHealth = useAppSelector(selectIsLosingHealth)
  const actionMessage = useAppSelector(selectActionMessage)

  const dispatch = useAppDispatch()

  useEffect(() => {
    setTable(allPlayersInfo.filter(player => { return (player.name === username) })[0].table)
  }, [allPlayersInfo])

  useEffect(() => {
    socket.on('my_role', (role: string) => {
      setRole(role)
    })

    return () => {
      socket.off('my_role')
    }
  }, [])

  function cancelTargetSelect () {
    dispatch(setSelectPlayerTargetFalse())
    dispatch(setSelectCardTargetFalse())
    dispatch(setActiveCard(null))
  }

  function loseHealth () {
    dispatch(setCharacterUsableFalse())
    dispatch(setIsLosingHealthFalse())
    dispatch(setMyHandNotPlayable())
    dispatch(setActionMessage(''))

    // player can decide not to use Jourdonnais
    if (character === 'Jourdonnais' && characterUsable) {
      dispatch(setCharacterUsableFalse())
    }

    socket.emit('lose_health', { username, currentRoom })
  }

  function endTurn () {
    dispatch(setSelectPlayerTargetFalse())
    dispatch(setSelectCardTargetFalse())
    dispatch(setDeckActiveFalse())
    dispatch(setActionMessage(''))

    if (myHand.length > myHealth) {
      dispatch(setDiscardingTrue())
      // dispatch(setMyHandPlayable())
    } else {
      dispatch(setMyHandNotPlayable())
      dispatch(setDiscardingFalse())

      socket.emit('end_turn', currentRoom)
    }
  }

  function activateCharacter () {
    if (!characterUsable && character !== 'Sid Ketchum') return

    if (character === 'Jourdonnais') {
      dispatch(setCharacterUsableFalse())
      socket.emit('jourdonnais_barel', { currentRoom, username })
    }

    if (character === 'Sid Ketchum') {
      dispatch(setDiscardingTrue())
    }
  }

  function handleCharacterClick () {
    if (
      (characterUsable && character !== 'Kit Carlson') ||
      (characterUsable && character === 'Jesse Jones') ||
      (currentPlayer === username && (character === 'Sid Ketchum') && nextTurn)) {
      activateCharacter()
    }
  }

  function predictUseBlueCard (cardName: string, cardDigit: number, cardType: string) {
    // splice card from my hand
    const newMyHand = [...myHand]
    const cardIndex = myHand.findIndex(card => (card.name === cardName && card.digit === cardDigit && card.type === cardType))
    newMyHand.splice(cardIndex, 1)

    dispatch(setMyHand(newMyHand))
  }

  if (character === null) {
    return null
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const characterSource = '/gfx/characters/' + character.replace(/\s/g, '') + '.png'
  // after character choice th client sends req to server to get random role
  // while waiting for the role, it is "", so require() would not load
  // this is hacky, I'm sorry
  let roleSource
  if (role !== '' && role !== undefined && role !== null) {
    roleSource = '/gfx/roles/' + role + '.png'
  }

  let characterStyles = {}
  if ((characterUsable && character !== 'Kit Carlson') || (characterUsable && character === 'Jesse Jones') || (currentPlayer === username && (character === 'Sid Ketchum') && nextTurn)) {
    if (character !== 'Pedro Ramirez') {
      characterStyles = { border: 'solid 2px red', cursor: 'pointer' }
    }
  }

  return (
    <div className='relative max-w-[600px] xs:max-w-[900px] w-full'>
      <div
        className='absolute mb-1 xs:mb-2 space-x-2 flex justify-center left-[50%] translate-x-[-50%] translate-y-[-56px] sm:translate-y-[-94px] xs:translate-y-[-130px]'
        id='player-table'
      >
        {table.map(card => {
          return (
            <CardOnTable
              card={card}
              confirmCardTarget={confirmCardTarget}
              key={`${card.name}-${card.digit}-${card.type}`}
            />
          )
        })}
      </div>
      <div
        className='flex justify-between items-end mx-1 sm:mx-4 h-[94px] sm:h-[135px] xs:h-[176px] bg-beige rounded p-1 sm:p-2 pt-1 sm:pt-1 relative font-rye'
      >
        <div className='flex min-w-[38px] sm:min-w-[60px] xs:min-w-[80px] flex-col text-[10px] xs:text-sm items-start'>
          <div className='flex flex-col justify-start items-start'>
            <div className='overflow-hidden'>{username}</div>
            <div>HP: <span id='player-health'>{myHealth}</span></div>
          </div>
          <div className='relative group'>
            <img
              src={characterSource}
              id={character}
              style={characterStyles}
              onClick={() => { handleCharacterClick() }}
              className='w-[38px] sm:w-[60px] xs:w-[80px] rounded-md mr-4'
              alt="Player character"
            >
            </img>
            <div className='hidden p-1 rounded group-hover:flex group-hover:flex-col group-hover:justify-center top-[-86px] left-[-60px] w-[200px] mx-auto bg-transparentBlack text-white absolute'>
              <div className='text-xl'>
                {character}
              </div>
              <div className='text-xs'>
                {getCharacterDescription(character)}
              </div>
            </div>
          </div>
        </div>

        {role !== '' &&
          <div className='flex w-[120px] relative group'>
            <img
              className='w-[38px] sm:w-[60px] xs:w-[80px]'
              src={roleSource} alt="">
            </img>
            <div className='hidden p-1 rounded group-hover:flex group-hover:flex-col group-hover:justify-center top-[-70px] left-[-38px] w-[160px] mx-auto bg-transparentBlack text-white absolute'>
              <div className='text-xl'>
                {role}
              </div>
              <div className='text-xs'>
                {getRoleDescription(role)}
              </div>
            </div>
          </div>
        }

        <div className='w-full h-full justify-center items-center'>
          <div className='flex w-full min-h-[14px] sm:min-h-[28px] justify-center items-center text-red-900 text-[10px] sm:text-sm md:text-lg'>
            {actionMessage}
          </div>
          <div
            className='overflow-y-auto flex h-full justify-center items-start flex-wrap'
            id='player-hand'
          >
            {myHand.map(card => {
              return (
                <Card
                  card={card}
                  predictUseCard={predictUseCard}
                  predictUseBlueCard={predictUseBlueCard}
                  key={`${card.name}-${card.digit}-${card.type}`}
                />
              )
            })}
          </div>
        </div>

        <div className='flex flex-col justify-start h-full w-[120px] px-1 py-0 space-y-2 sm:pt-2'>
          {(currentPlayer === username && nextTurn && !characterUsable && emporioState.length === 0 && !(myDrawChoice.length > 0)) && <Button onClick={endTurn} value={'End turn'} size={1.2} />}
          {(selectPlayerTarget && nextTurn && currentPlayer === username) && <Button onClick={cancelTargetSelect} value={'Cancel'} size={1.2} /> }
          {discarding && <Button onClick={() => { dispatch(setDiscardingFalse()) }} value={'Cancel'} size={1.2} />}
          {isLosingHealth && <Button onClick={loseHealth} value={'Lose health'} size={1.2} />}

        </div>

      </div>
    </div>
  )
}
