type GoogleCredentialResponse = {
  credential: string
}

type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (configuration: {
        client_id: string
        callback: (response: GoogleCredentialResponse) => void
        auto_select?: boolean
      }) => void
      renderButton: (parent: HTMLElement, options: {
        theme?: 'outline' | 'filled_blue' | 'filled_black'
        size?: 'large' | 'medium' | 'small'
        text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
        shape?: 'rectangular' | 'pill' | 'circle' | 'square'
        width?: number
      }) => void
    }
  }
}

interface Window {
  google?: GoogleIdentity
}
