import React from 'react';
import {Screen, Text} from '../../components';
import type {TabScreenProps} from '../../navigation/types';

// PLACEHOLDER — to be implemented.
export function LearnScreen(_props: TabScreenProps<'Learn'>) {
  return (
    <Screen edges={['top']}>
      <Text variant="title">Learn</Text>
    </Screen>
  );
}
