'use client';
import {
  Avatar,
  Box,
  Divider,
  Flex,
  Heading,
  IconButton,
  InputGroup,
  InputRightElement,
  Link,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { Fragment, useRef, useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { BsGithub } from 'react-icons/bs';
import { VscRefresh } from 'react-icons/vsc';
import { FaHatWizard } from 'react-icons/fa';

import Markdown from './components/Markdown';

const UserAvatar = () => {
  return (
    <Flex flexShrink={0}>
      <Avatar size="sm" color="white" bg="blue.500" borderRadius="8px" mt={1} />
    </Flex>
  );
};

const AssistantAvatar = () => {
  return (
    <Flex flexShrink={0}>
      <Avatar
        icon={<FaHatWizard />}
        size="sm"
        color="white"
        bg="purple.500"
        borderRadius="8px"
        mt={1}
      />
    </Flex>
  );
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setMessage('');
      let newMessages: Message[] = [...messages, { role: 'user', content: message }];
      setMessages(newMessages);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error('Error sending data');
      }

      if (response.body) {
        const reader = response.body.getReader();
        let incompleteChunk = ''; // Buffer to hold incomplete data

        const processResult = async ({
          done,
          value,
        }: {
          done: boolean;
          value?: Uint8Array;
        }): Promise<void> => {
          if (done) {
            console.log('Stream finished.');
            setIsLoading(false);
            return;
          }

          const decoder = new TextDecoder();
          let chunk = incompleteChunk + decoder.decode(value, { stream: true });
          let dataObjects = chunk.split('\n');

          // Check if the last object is complete
          if (!chunk.endsWith('\n')) {
            incompleteChunk = dataObjects.pop() || ''; // Save incomplete chunk for next iteration
          } else {
            incompleteChunk = ''; // Reset if all chunks are complete
          }

          dataObjects = dataObjects
            .filter(Boolean)
            .map((data) => data.replace(/^data: /, ''))
            .filter((item) => item !== '[DONE]');

          dataObjects.forEach((data) => {
            try {
              console.log('Data:', data);
              const jsonData = JSON.parse(data);
              if (jsonData.choices) {
                const { content, role } = jsonData.choices[0].delta;

                if (role === 'assistant') {
                  newMessages = [...newMessages, { role, content }];
                  setMessages(newMessages);
                } else if (content) {
                  const lastMessage = newMessages[newMessages.length - 1];
                  lastMessage.content += content;
                  setMessages([...newMessages.slice(0, -1), lastMessage]);
                }
              }
            } catch (error) {
              console.error('Error parsing JSON', error);
            }
          });

          reader.read().then(processResult);
        };

        reader.read().then(processResult);
      }
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (message.trim().length <= 0) return;
    if (isLoading) return;
    if (event.shiftKey) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    setMessages([]);
  };

  return (
    <>
      <Flex
        flexDir="column"
        gap={40}
        justify="space-between"
        flex={1}
        height="100%"
        overflowY="auto"
        w="full"
        padding="24px"
      >
        <Flex
          flexDir="column"
          align="center"
          gap={2}
          paddingBottom="150px"
          maxW={1100}
          w="full"
          margin="0 auto"
        >
          <Heading as="h1" size="lg">
            Debugging wizard 🧙‍♂️
          </Heading>
          <Text as="p" textAlign="center">
            Bugs shall not pass!! 🐛
          </Text>
          {messages.map((message, index) => (
            <Fragment key={index}>
              <Divider />
              <Flex key={index} my={4} w="full">
                {message.role === 'assistant' ? <AssistantAvatar /> : <UserAvatar />}
                <Box px={4} py={2} ml={4}>
                  <Markdown>{message.content}</Markdown>
                </Box>
              </Flex>
            </Fragment>
          ))}
        </Flex>
      </Flex>
      <Box
        w="full"
        position="absolute"
        pointerEvents="none"
        bottom="0"
        left="0"
        bg="linear-gradient(transparent, 50%, rgb(26, 32, 44))"
        paddingX={{ base: 0, md: 4 }}
      >
        <Stack
          spacing={4}
          mt={16}
          position="relative"
          marginX={{ base: 0, md: 'auto' }}
          maxW={{ base: '100%', md: '43em', xl: '75em' }}
          marginBottom={{ base: 0, md: 50 }}
          pointerEvents="all"
        >
          <InputGroup size="md">
            <Textarea
              ref={textAreaRef}
              bg="rgb(26, 32, 44)"
              resize="none"
              placeholder="Type here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              borderRadius={{ base: 0, md: '6px' }}
              borderWidth={{ base: 0, md: '1px' }}
              borderTopWidth="1px"
              paddingRight="50px"
            />
            <InputRightElement width="6em" mt={1}>
              <IconButton
                aria-label="Reset"
                disabled={isLoading}
                variant="ghost"
                icon={<VscRefresh />}
                colorScheme="blue"
                onClick={handleReset}
              />
              <IconButton
                aria-label="Send"
                disabled={isLoading}
                variant="ghost"
                icon={<FaPaperPlane />}
                colorScheme="blue"
                onClick={handleSendMessage}
              />
            </InputRightElement>
          </InputGroup>
        </Stack>
      </Box>
    </>
  );
}
