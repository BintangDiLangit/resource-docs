import { Head, useForm } from '@inertiajs/react'
import { GuestLayout } from 'layouts'
import React from 'react'
import { Button, Checkbox, Form, TextField } from 'ui'

interface LoginProps {
    status: string
    canResetPassword: boolean
}

export default function Login(args: LoginProps) {
    const { status, canResetPassword } = args
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: ''
    })

    const submit = (e: { preventDefault: () => void }) => {
        e.preventDefault()
        post(route('login'), {
            onSuccess: () => window.location.reload(),
        });
    }

    return (
        <>
            <Head title="Log in" />

            {status && <div className="mb-4 text-sm font-medium text-green-600 dark:text-green-400">{status}</div>}

            <Form validationErrors={errors} onSubmit={submit} className="space-y-6">
                <TextField
                    label="Email"
                    type="email"
                    name="email"
                    value={data.email}
                    autoComplete="username"
                    autoFocus
                    onChange={(v) => setData('email', v)}
                    errorMessage={errors.email}
                    isRequired
                />
                <TextField
                    type="password"
                    name="password"
                    label="Password"
                    value={data.password}
                    autoComplete="current-password"
                    onChange={(v) => setData('password', v)}
                    errorMessage={errors.password}
                    isRequired
                />

                <div className="flex items-center justify-between">
                    <Checkbox name="remember" onChange={(v) => setData('remember', v as any)}>
                        Remember me
                    </Checkbox>
                </div>

                <div className="flex items-center justify-between">
                    <Button isDisabled={processing} type="submit">
                        Log in
                    </Button>
                </div>
            </Form>
        </>
    )
}

Login.layout = (page: React.ReactNode) => {
    return <GuestLayout header="Login" description="Log in to your account." children={page} />
}
