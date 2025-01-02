import ReactDOM from 'react-dom/client'
import React, { useCallback } from 'react';
import { VoiceContextType, VoiceProvider, useVoice } from '@humeai/voice-react';
import { ToolCallMessage } from 'hume/api/resources/empathicVoice';
import { useEffect } from 'react';

let i = 0;
const questions = [
  "What is your age?",
  "Which languages do you speak?",
  "Do you have any dietary restrictions, and if so, what are they?",
  "Do you have any training as a clown?",
  "Are you familiar with the work of David Macaulay?",
  "Do you have any conscientious objections to war?",
]

const App = () => {
  return <VoiceProvider
    auth={{
      type: 'apiKey',
      value: '<API_KEY>'
    }}
    configId="<CONFIG_ID>"
  >
    <Chat />
  </VoiceProvider>
}

// Hook for listening to tool call messages. We use this instead of passing a function to the `onToolCall`
// because that function can't have anything from `useVoice` (like `sendToolMessage`) in scope.
const useToolCallback = (
  messages: VoiceContextType['messages'],
  callback: (toolCallMessage: ToolCallMessage) => void) => {
  const [messageCursor, setMessageCursor] = React.useState(0);
  useEffect(() => {
    setMessageCursor(messages.length);
    messages.slice(messageCursor).filter(m => m.type === 'tool_call').forEach(m => callback(m));
  }, [messages])
}

const Chat = () => {
  const { connect, disconnect, mute, unmute, isMuted, readyState, messages, sendToolMessage } = useVoice();
  const info = { readyState, isMuted }
  const [answers, setAnswers] = React.useState<any[]>([])
  useToolCallback(messages, (m) => {
    if (m.name === 'next_question') {
      const json = JSON.parse(m.parameters)
      if (json.answer) {
        setAnswers([...answers, json.answer])
        i++;
      }
      sendToolMessage({
        type: 'tool_response',
        toolCallId: m.toolCallId,
        content: questions[i]
      })
      return
    }
    console.error('Unknown tool call:', m)
  })
  return <>
    <pre>{JSON.stringify({answers}, null, 2)}</pre>
    <button onClick={() => connect()}>Connect</button>
    <button onClick={() => disconnect()}>Disconnect</button>
    <button onClick={() => mute()}>Mute</button>
    <button onClick={() => unmute()}>Unmute</button>
    <pre>{JSON.stringify(info, null, 2)}</pre>
  </>
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
console.log('loaded...')
