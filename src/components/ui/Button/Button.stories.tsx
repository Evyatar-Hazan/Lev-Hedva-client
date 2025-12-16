import React from 'react';
import { Meta, Story } from '@storybook/react';
import { useTranslation } from 'react-i18next';
import Button, { ButtonProps } from './Button';

const ButtonWithTranslation: React.FC<ButtonProps> = args => {
  const { t } = useTranslation();
  return <Button {...args}>{t('common.clickHere')}</Button>;
};

export default {
  title: 'UI/Button',
  component: Button,
} as Meta<typeof Button>;

const Template: Story<ButtonProps> = args => <ButtonWithTranslation {...args} />;

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
