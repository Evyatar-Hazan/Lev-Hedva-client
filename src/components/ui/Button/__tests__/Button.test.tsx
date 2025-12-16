// 🧪 Unit Tests for UI Components - Button
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import Button from '../Button';

// Mock theme for testing
const mockTheme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={mockTheme}>{component}</ThemeProvider>);
};

describe('🎨 Button Component Tests', () => {
  test('should render button with text', () => {
    // Act
    renderWithTheme(<Button>Click me</Button>);

    // Assert
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  test('should handle click events', () => {
    // Arrange
    const handleClick = jest.fn();

    // Act
    renderWithTheme(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('should be disabled when loading', () => {
    // Act
    renderWithTheme(<Button loading>Submit</Button>);

    // Assert
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  test('should show loading state', () => {
    // Act
    renderWithTheme(<Button loading>Submit</Button>);

    // Assert
    // Should show loading indicator (CircularProgress)
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('should apply primary variant styles', () => {
    // Act
    renderWithTheme(<Button variant="primary">Primary Button</Button>);

    // Assert
    const button = screen.getByRole('button');
    expect(button).toHaveClass(/primary/i);
  });

  test('should apply secondary variant styles', () => {
    // Act
    renderWithTheme(<Button variant="secondary">Secondary Button</Button>);

    // Assert
    const button = screen.getByRole('button');
    expect(button).toHaveClass(/secondary/i);
  });

  test('should be full width when specified', () => {
    // Act
    renderWithTheme(<Button fullWidth>Full Width Button</Button>);

    // Assert
    const button = screen.getByRole('button');
    expect(button).toHaveClass(/fullWidth/i);
  });

  test('should apply different sizes', () => {
    // Test small size
    const { rerender } = renderWithTheme(<Button size="small">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass(/small/i);

    // Test medium size
    rerender(
      <ThemeProvider theme={mockTheme}>
        <Button size="medium">Medium</Button>
      </ThemeProvider>
    );
    expect(screen.getByRole('button')).toHaveClass(/medium/i);

    // Test large size
    rerender(
      <ThemeProvider theme={mockTheme}>
        <Button size="large">Large</Button>
      </ThemeProvider>
    );
    expect(screen.getByRole('button')).toHaveClass(/large/i);
  });

  test('should forward ref correctly', () => {
    // Arrange
    const ref = React.createRef<HTMLButtonElement>();

    // Act
    renderWithTheme(<Button ref={ref}>Button with ref</Button>);

    // Assert
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  test('should handle form submission', () => {
    // Arrange
    const handleSubmit = jest.fn(e => e.preventDefault());

    // Act
    renderWithTheme(
      <form onSubmit={handleSubmit}>
        <Button type="submit">Submit</Button>
      </form>
    );
    fireEvent.click(screen.getByRole('button'));

    // Assert
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  test('should not trigger click when disabled', () => {
    // Arrange
    const handleClick = jest.fn();

    // Act
    renderWithTheme(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );
    fireEvent.click(screen.getByRole('button'));

    // Assert
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('should support custom CSS classes', () => {
    // Act
    renderWithTheme(<Button className="custom-button-class">Custom Button</Button>);

    // Assert
    expect(screen.getByRole('button')).toHaveClass('custom-button-class');
  });

  test('should support custom styles', () => {
    // Act
    renderWithTheme(<Button style={{ backgroundColor: 'red' }}>Styled Button</Button>);

    // Assert
    const button = screen.getByRole('button');
    expect(button).toHaveStyle('background-color: red');
  });

  describe('♿ Accessibility', () => {
    test('should have proper ARIA attributes', () => {
      // Act
      renderWithTheme(<Button aria-label="Custom aria label">Button</Button>);

      // Assert
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom aria label');
    });

    test('should support aria-describedby', () => {
      // Act
      renderWithTheme(<Button aria-describedby="button-description">Described Button</Button>);

      // Assert
      expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', 'button-description');
    });

    test('should be keyboard accessible', () => {
      // Arrange
      const handleClick = jest.fn();

      // Act
      renderWithTheme(<Button onClick={handleClick}>Keyboard Button</Button>);
      const button = screen.getByRole('button');

      // Simulate keyboard events
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });

      // Assert - Button should respond to both Enter and Space
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    test('should have proper focus management', () => {
      // Act
      renderWithTheme(<Button>Focusable Button</Button>);
      const button = screen.getByRole('button');

      // Focus the button
      button.focus();

      // Assert
      expect(button).toHaveFocus();
    });
  });

  describe('🎨 Visual States', () => {
    test('should show error state', () => {
      // Act
      renderWithTheme(<Button color="error">Error Button</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass(/error/i);
    });

    test('should show success state', () => {
      // Act
      renderWithTheme(<Button color="success">Success Button</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass(/success/i);
    });

    test('should handle loading text change', () => {
      // Arrange
      const { rerender } = renderWithTheme(<Button loading={false}>Submit</Button>);

      // Initially not loading
      expect(screen.getByRole('button')).toHaveTextContent('Submit');
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

      // Act - Start loading
      rerender(
        <ThemeProvider theme={mockTheme}>
          <Button loading={true}>Loading...</Button>
        </ThemeProvider>
      );

      // Assert - Loading state
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('⚠️ Edge Cases', () => {
    test('should handle undefined onClick', () => {
      // Act & Assert - should not throw
      expect(() => {
        renderWithTheme(<Button>Button without onClick</Button>);
        fireEvent.click(screen.getByRole('button'));
      }).not.toThrow();
    });

    test('should handle extremely long text', () => {
      // Arrange
      const longText = 'A'.repeat(1000);

      // Act
      renderWithTheme(<Button>{longText}</Button>);

      // Assert
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent(longText);
    });

    test('should handle special characters in text', () => {
      // Act
      renderWithTheme(<Button>🚀 Rocket Button! @#$%^&*()</Button>);

      // Assert
      expect(screen.getByRole('button')).toHaveTextContent('🚀 Rocket Button! @#$%^&*()');
    });

    test('should handle rapid clicks', () => {
      // Arrange
      const handleClick = jest.fn();

      // Act
      renderWithTheme(<Button onClick={handleClick}>Rapid Click</Button>);
      const button = screen.getByRole('button');

      // Rapid fire clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }

      // Assert
      expect(handleClick).toHaveBeenCalledTimes(10);
    });
  });
});
