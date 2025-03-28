import { useId } from 'react';

export interface AuthFormProps {
  onSubmit: (username: string, password: string) => void;
  submitText: string;
}

export default function AuthForm({ onSubmit, submitText }: AuthFormProps) {
  const usernameId = useId();
  const passwordId = useId();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);

        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        onSubmit(username, password);
      }}
    >
      <label htmlFor={usernameId}>Username</label>
      <input id={usernameId} name="username" type="username" />

      <label htmlFor={passwordId}>Password</label>
      <input id={passwordId} name="password" type="password" />

      <button type="submit">{submitText}</button>
    </form>
  );
}
