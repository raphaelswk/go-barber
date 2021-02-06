import React, { ChangeEvent, useCallback, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { FiMail, FiUser, FiLock, FiCamera, FiArrowLeft } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import getValidationErrors from '../../utils/getValidationError';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Container, Content, AvatarInput } from './styles';

import api from '../../services/api';

import { useToast } from '../../hooks/toast';
import { useAuth } from '../../hooks/auth';

interface ProfileFormData {
    name: string;
    email: string;
    old_password: string;
    password: string;
    password_confirmation: string;
}

const Profile: React.FC = () => {
    const formRef = useRef<FormHandles>(null);
    const { addToast } = useToast();
    const history = useHistory();

    const { user, updateUser } = useAuth();

    const handleSubmit = useCallback(async (data: ProfileFormData) => {
        try {            
            formRef.current?.setErrors({});

            const schema = Yup.object().shape({
                name: Yup.string().required('Name is required'),
                email: Yup.string().required('Email is required').email('Type a valid email'),
                old_password: Yup.string(),
                
                password: Yup.string().when('old_password', {
                    is: val => !!val.length,
                    then: Yup.string().required('Mandatory field'),
                    otherwise: Yup.string(),
                }),

                password_confirmation: Yup.string().nullable().when('old_password', {
                    is: val => !!val.length,
                    then: Yup.string().required('Mandatory field'),
                    otherwise: Yup.string(),
                }).oneOf([Yup.ref('password'), null],'Passwords must match'),
            });

            await schema.validate(data, {
                abortEarly: false,
            });

            const { 
                name, 
                email, 
                old_password, 
                password, 
                password_confirmation 
            } = data;
            
            const formData = Object.assign({
                name,
                email,
                ...(old_password)
                ? {
                    old_password,
                    password,
                    password_confirmation
                }: {}
            });

            const response = await api.put('/profile', formData);
            
            updateUser(response.data);

            history.push('/dashboard');

            addToast({
                type: 'success',
                title: 'Updated Profile',
                description: 'Your profile information have successfully updated'
            });
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const errors = getValidationErrors(err);
                formRef.current?.setErrors(errors);
            }

            addToast({
                type: 'error',
                title: 'Updating error',
                description: 'An error has occurred when updating your profile, please try again'
            });
        }
    }, [addToast, history, updateUser]);

    const handleAvatarChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const data = new FormData();
        if (e.target.files) {
            data.append('avatar', e.target.files[0])

            api.patch('/users/avatar', data).then((response) => {
                updateUser(response.data);
                
                addToast({
                    type: 'success',
                    title: 'Avatar has been updated'
                });
            })
        }
    }, [addToast, updateUser])

    return (
        <Container>
            <header>
                <div>
                    <Link to="/dashboard">
                        <FiArrowLeft />
                    </Link>
                </div>
            </header>

            <Content>
                <Form 
                    ref={formRef} 
                    initialData={{
                        name: user.name,
                        email: user.email,
                    }}
                    onSubmit={handleSubmit}
                >
                    <AvatarInput>
                        <img src={user.avatar_url} alt={user.name}/>
                        <label htmlFor="avatar">
                            <FiCamera />
                            <input type="file" id="avatar" onChange={handleAvatarChange} />
                        </label>
                    </AvatarInput>

                    <h1>My profile</h1>

                    <Input name="name" icon={FiUser} type="text" placeholder="Name"/>

                    <Input name="email" icon={FiMail} type="email" placeholder="Email"/>

                    <Input 
                        containerStyle={{ marginTop: 24 }}
                        name="old_password" 
                        icon={FiLock} 
                        type="password" 
                        placeholder="Current password"
                    />
                    
                    <Input name="password" icon={FiLock} type="password" placeholder="New password"/>
                    
                    <Input name="password_confirmation" icon={FiLock} type="password" placeholder="Confirm password"/>

                    <Button type="submit">
                        Confirm changes
                    </Button>
                </Form>
            </Content>
        </Container>
    );
};

export default Profile;