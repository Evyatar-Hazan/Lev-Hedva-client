import React from 'react';
import { Meta, Story } from '@storybook/react';
import Button, { ButtonProps } from './Button';

export default {
  title: 'UI/Button',
  component: Button,
} as Meta<typeof Button>;

const Template: Story<ButtonProps> = (args) => <Button {...args}>לחץ כאן</Button>;

export const Primary = Template.bind({});
Primary.args = {
  variant: 'primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: 'secondary',
};

export const Outlined = Template.bind({});
Outlined.args = {
  variant: 'outlined',
};
