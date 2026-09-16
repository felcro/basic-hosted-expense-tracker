import type { InterfaceToastProps } from '@gluestack-ui/core/lib/esm/toast/creator/types'

import { HStack } from '@/components/ui/hstack'
import {
  Toast as GluestackToast,
  ToastDescription,
  ToastTitle,
  useToast,
} from '@/components/ui/toast'
import { VStack } from '@/components/ui/vstack'

import { AlertCircleIcon, CheckIcon, Icon } from '../../../components/ui/icon'
import { useToastContainerStyle } from '../../lib/toastInsets'

type Action = 'error' | 'success'
type ToastComponentStyling = 'toast' | 'icon' | 'iconStyle' | 'toastTitle'

type ToastProps = Pick<InterfaceToastProps, 'placement' | 'avoidKeyboard'> & {
  toast: ReturnType<typeof useToast>
  toastContainerStyle: ReturnType<typeof useToastContainerStyle>
  action?: Action
  description: string
}

const toastProperties: Record<
  Action,
  Record<ToastComponentStyling, string | React.ElementType>
> = {
  error: {
    toast: 'border-destructive',
    icon: AlertCircleIcon,
    iconStyle: 'stroke-destructive',
    toastTitle: 'text-destructive',
  },
  success: {
    toast: 'border-accent-lime',
    icon: CheckIcon,
    iconStyle: 'stroke-accent-lime',
    toastTitle: 'text-accent-lime',
  },
}

function actionToToastTitle(action: Action) {
  const actionKey =
    Object.keys(toastProperties).filter((key) => key === action)[0] ?? ''
  return actionKey?.charAt(0).toUpperCase() + actionKey?.slice(1) + '!'
}

export function showToast({
  toast,
  toastContainerStyle,
  placement = 'bottom right',
  avoidKeyboard = true,
  action = 'success',
  description,
}: ToastProps) {
  return toast.show({
    placement,
    avoidKeyboard,
    containerStyle: toastContainerStyle,
    render: ({ id }) => {
      const toastId = 'toast-' + id
      return (
        <GluestackToast
          nativeID={toastId}
          action={action}
          variant="outline"
          className={`p-4 gap-6 ${toastProperties[action].toast} web:w-full sm:min-w-96 max-w-96 bg-card shadow-hard-2 flex-row mr-6 mb-0`}
        >
          <HStack space="md">
            <Icon
              as={toastProperties[action].icon as React.ElementType}
              className={`mt-0.5 ${toastProperties[action].iconStyle}`}
            />
            <VStack space="xs">
              <ToastTitle
                className={`font-semibold ${toastProperties[action].toastTitle}`}
              >
                {actionToToastTitle(action)}
              </ToastTitle>
              <ToastDescription size="sm">{description}</ToastDescription>
            </VStack>
          </HStack>
        </GluestackToast>
      )
    },
  })
}
