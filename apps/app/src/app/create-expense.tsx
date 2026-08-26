import { Link } from 'expo-router'
import { Text } from 'react-native-paper'

import { BaseView } from '../components/common/BaseView'

export default function About() {
  return (
    <BaseView title="Create Expense">
      <Link href="/">
        <Text numberOfLines={1}>Home Page</Text>
      </Link>
    </BaseView>
  )
}
