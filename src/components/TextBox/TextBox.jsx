import React, { useState, useEffect } from 'react'
import localstyle from './TextBox.module.scss';

import useSound from 'use-sound';
import textBeep from 'audio/text.mp3';

import { v4 as uuidv4 } from 'uuid';

const useForceUpdate = () => useState()[1];

function TextBox(props) {

  let sfx = true
  const forceUpdate = useForceUpdate();

  let delayMedian = 40
  let delayQuiver = 20

  const [play] = useSound(textBeep, {playbackRate: .25, volume: 0.15} );

  let [doneTyping, setDoneTyping]   = useState(false)
  let [typedWords, setTypedWords]   = useState([])
  let [wordIndex,  setWordIndex ]   = useState(0)
  let [wordsToType, setWordsToType] = useState(props.textToType.split(""))

  useEffect( () => {
    type()
  }, [typedWords, wordsToType])

  function type() {
    if (typedWords.length < wordsToType.length) {
      // console.log("Parsing next word. . .")
      parseNextWord()
    }
  }

  async function parseNextWord() {
    let nextWord = wordsToType[wordIndex]
    let typedWordsUpdate = [...typedWords]


    // Check for control code
    if (nextWord.charAt(0) === "[") {
      let res = await handleControlCode(nextWord)
      return // Don't print '['
    }

    typedWordsUpdate.push(nextWord)
    setWordIndex(wordIndex+1)

    let printDelay = setTimeout( () => {
      if (sfx) { play() }
      setTypedWords(typedWordsUpdate)
    }, getTypeDelay() )

  }

  async function handleControlCode(controlcode) {

    // Prevent using old values from last typedWords update
    let minTimeout = delayMedian+delayQuiver+10

    return new Promise( (res) => {
      setTimeout( async () => {
        let arrayToModify = [...wordsToType]
        let ccStartIndex = arrayToModify.findIndex(e => e === '[')
        let ccEndIndex   = arrayToModify.findIndex(e => e === ']')
        let ccLength     = ccEndIndex - ccStartIndex
        let cc = arrayToModify.splice(ccStartIndex, ccLength + 1).join('')

        // Wait CC
        if (cc.charAt(1) === "w") {
            let timeDelay = cc.replace(/[a-z\[\]\']*/g, "")
            await wait(timeDelay)
        }

        setWordsToType([...arrayToModify])
        setWordIndex( wordIndex-(ccLength) )
        forceUpdate();

        res()
      }, minTimeout ) // Prevent using old values from last typedWords update
    })
  }

  function getTypeDelay() {
    return Math.floor( Math.random() * (delayMedian+delayQuiver) + (delayMedian-delayQuiver) )
  }

  async function wait(time) {
    return new Promise( (res) => {
      setTimeout( () => {
        res()
      }, time)
    })
  }

  function getWords() {
    let wordsAsSpan = []
    for (let i=0; i < typedWords.length; i++) {

      // Check for special break character
      if (typedWords[i] === '~') {
        wordsAsSpan.push(<br key={"break_1"+i}/>)
        wordsAsSpan.push(<br key={"break_2"+i}/>)
      } else {
        wordsAsSpan.push(<span key={i} className={localstyle.word}>{typedWords[i]}</span>)
      }

    }

    if (typedWords.length === wordsToType.length) {
      wordsAsSpan.push(<span key="finalSpan"></span>)
    }

    return wordsAsSpan
  }

  return (

    <div className={localstyle.textbox}>
      <p>{getWords()}</p>
    </div>

  )

}

export default TextBox;
