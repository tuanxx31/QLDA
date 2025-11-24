import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

export function parseMentions(content: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const mentionRegex = /@(\w+)/g;
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }
    parts.push(
      <Text key={match.index} strong style={{ color: '#1677ff' }}>
        {match[0]}
      </Text>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : content;
}
