import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true,
      error 
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto max-w-2xl p-4">
          <Alert variant="destructive">
            <AlertTitle>שגיאה בלתי צפויה</AlertTitle>
            <AlertDescription>
              <div className="mt-2">
                <p className="text-sm">
                  {this.state.error?.message || 'אירעה שגיאה בלתי צפויה. אנא נסו שוב.'}
                </p>
                <Button 
                  onClick={this.handleReset}
                  variant="outline"
                  className="mt-4"
                >
                  נסה שוב
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 