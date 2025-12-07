import React from 'react';
import { 
  TextField, 
  TextFieldProps, 
  InputAdornment,
  IconButton 
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  /** Input label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: boolean;
  /** Required field indicator */
  required?: boolean;
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  /** Input variant */
  variant?: 'outlined' | 'filled' | 'standard';
  /** Text direction for RTL support */
  dir?: 'ltr' | 'rtl' | 'auto';
  /** Start adornment */
  startAdornment?: React.ReactNode;
  /** End adornment */
  endAdornment?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error = false,
  required = false,
  type = 'text',
  variant = 'outlined',
  dir = 'auto',
  startAdornment,
  endAdornment,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const getInputType = () => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  const getEndAdornment = () => {
    if (type === 'password') {
      return (
        <InputAdornment position="end">
          <IconButton
            onClick={handlePasswordToggle}
            edge="end"
            aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
          {endAdornment}
        </InputAdornment>
      );
    }
    return endAdornment ? <InputAdornment position="end">{endAdornment}</InputAdornment> : undefined;
  };

  const getStartAdornment = () => {
    return startAdornment ? <InputAdornment position="start">{startAdornment}</InputAdornment> : undefined;
  };

  return (
    <TextField
      label={label}
      helperText={helperText}
      error={error}
      required={required}
      type={getInputType()}
      variant={variant}
      dir={dir}
      InputProps={{
        startAdornment: getStartAdornment(),
        endAdornment: getEndAdornment(),
        ...props.InputProps,
      }}
      {...props}
    />
  );
};

export default Input;