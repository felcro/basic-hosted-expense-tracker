import { BaseView } from '../components/common/BaseView'
import { LinkText } from '../components/common/Text'
import { routes } from '../lib/routes'

export default function About() {
  return (
    <BaseView title="About">
      <LinkText href={routes.home.href} label="Home Page" />
    </BaseView>
  )
}
