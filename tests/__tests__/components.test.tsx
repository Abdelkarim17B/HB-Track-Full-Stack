import { render, screen } from '@testing-library/react'

// Simple component tests that don't require complex mocking
describe('Component Tests', () => {
  it('renders button component', () => {
    const Button = ({ children }: { children: React.ReactNode }) => (
      <button className="btn">{children}</button>
    )
    
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeDefined()
    expect(screen.getByRole('button')).toBeDefined()
  })

  it('renders card component', () => {
    const Card = ({ title, content }: { title: string; content: string }) => (
      <div className="card">
        <h2>{title}</h2>
        <p>{content}</p>
      </div>
    )
    
    render(<Card title="Test Title" content="Test content" />)
    expect(screen.getByText('Test Title')).toBeDefined()
    expect(screen.getByText('Test content')).toBeDefined()
  })
})
