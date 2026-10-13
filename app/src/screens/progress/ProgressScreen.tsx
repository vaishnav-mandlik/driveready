import React from 'react';
import {Screen, Text} from '../../components';
import type {TabScreenProps} from '../../navigation/types';

// PLACEHOLDER — to be implemented.
export function ProgressScreen(_props: TabScreenProps<'Progress'>) {
  return (
    <Screen edges={['top']}>
      <Text variant="title">Progress</Text>
    </Screen>
  );
}
