# Folder Structure

The way you organize your directories inside the ${MOCKS_DIR}, determine how your endpoints will be available. Following examples will help you understand the folder structure you need to maintain.

## Basic GET Request to /hello-world

- Create a directory ${MOCKS_DIR}/hello-world
- Create a GET.mock file inside it with your required raw html response

## POST Request to /users

- Create a directory ${MOCKS_DIR}/users
- Create a POST.mock file inside it with your required raw html response

## GET Request to /users/:userId

- Create a directory ${MOCKS_DIR}/users/\_\_ (double underscore)
- Create a GET.mock file inside it with your required raw html response

Similarily you can create PUT.mock, DELETE.mock etc in your intended path. For wildcard, use directory name as \_\_ (double underscore)

!!! note

    Unlike original mockserver, request matching criteria, are taken care of, inside the .mock files instead of
    naming the files in a certain way. We intend to keep the file names simple and in the format
    *${HTTP_METHOD}.mock*
