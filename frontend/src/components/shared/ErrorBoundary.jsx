import { Component } from 'react'
import Icon from './Icons.jsx'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="animate-fade" style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: 24, gap: 16,
          color: 'var(--text-muted)',
        }}>
          <Icon name="alert" size={48} />
          <h2 style={{ color: 'var(--text-primary)', fontSize: 18 }}>Something went wrong</h2>
          <p style={{ fontSize: 13, maxWidth: 400, textAlign: 'center' }}>
            {this.state.error.message}
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
