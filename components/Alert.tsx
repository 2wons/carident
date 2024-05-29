import { AlertDialog, Button, XStack, YStack } from "tamagui";

import { ButtonProps } from "tamagui";
import { XCircle } from "@tamagui/lucide-icons";

interface AlertProps extends ButtonProps {
    title: string,
    message: string,
    label: string,
    onConfirm: () => void,
    danger?: boolean
}

export function AlertButton(props: AlertProps) {
  const { title, message, label, onConfirm, danger, ...other } = props
  return (
    <AlertDialog >
      <AlertDialog.Trigger asChild>
        <Button {...other}>{ label }</Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <AlertDialog.Content
          bordered
          elevate
          key="content"
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          x={0}
          scale={1}
          opacity={1}
          y={0}
        >
          <YStack space>
            <AlertDialog.Title>{ title }</AlertDialog.Title>

            <AlertDialog.Description>
              { message }
            </AlertDialog.Description>
            <XStack space="$3" justifyContent="flex-end">
              <AlertDialog.Cancel asChild>
                <Button>Cancel</Button>
              </AlertDialog.Cancel>

              <AlertDialog.Action asChild>
                <Button onPress={onConfirm} theme="active" backgroundColor={danger ? "$red10" : undefined}>Confirm</Button>
              </AlertDialog.Action>
            </XStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
