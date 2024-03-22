'use client';
import { useChat } from 'ai/react';
import {
  Avatar,
  Box,
  Divider,
  Flex,
  Heading,
  IconButton,
  InputGroup,
  Text,
  InputRightElement,
  Stack,
  Textarea,
} from '@chakra-ui/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { VscRefresh, VscTrash } from 'react-icons/vsc';
import { FaHatWizard } from 'react-icons/fa';

import Markdown from './components/Markdown';

const UserAvatar = () => (
  <Flex flexShrink={0}>
    <Avatar size="sm" color="white" bg="blue.500" borderRadius="8px" mt={1} />
  </Flex>
);

const AssistantAvatar = () => (
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

const localStorageKey = 'chatMessages';

export default function Chat() {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Initialize messages from local storage or default to an empty array if not found
  const [storedMessages, setStoredMessages] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem(localStorageKey);
      return savedMessages ? JSON.parse(savedMessages) : [];
    }
    return [];
  });

  const { messages, input, handleInputChange, handleSubmit, isLoading, reload } = useChat({ initialMessages: storedMessages });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(localStorageKey, JSON.stringify(messages));
    }
  }, [messages]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (input.trim().length <= 0) return;
    if (isLoading) return;
    if (event.shiftKey) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  const handleReset = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(localStorageKey);
    }
    window.location.reload()
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
          {messages.map((m, index) => (
            <Fragment key={index}>
              <Divider />
              <Flex my={4} w="full">
                {m.role === 'assistant' ? <AssistantAvatar /> : <UserAvatar />}
                <Box px={4} py={2} ml={4}>
                  <Markdown>{m.content}</Markdown>
                </Box>
              </Flex>
            </Fragment>
          ))}
        </Flex>
      </Flex>
      <Box
        ref={formRef}
        as="form"
        onSubmit={handleSubmit}
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
              value={input}
              onChange={handleInputChange}
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
                onClick={() => reload()}
              />
              <IconButton
                aria-label="Send"
                disabled={isLoading}
                type="submit"
                variant="ghost"
                icon={<FaPaperPlane />}
                colorScheme="blue"
              />
              <IconButton
                aria-label="Reset"
                disabled={isLoading}
                variant="ghost"
                icon={<VscTrash/>}
                colorScheme="red"
                onClick={() => handleReset()}
              />
            </InputRightElement>
          </InputGroup>
        </Stack>
      </Box>
    </>
  );
}
