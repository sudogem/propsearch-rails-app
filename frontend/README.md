# propsearch-rails-app frontend

## Development Environment Setup

- NOTE: All commands should be ran in the root directory unless otherwise specified

**Installing Node**
1. Install [nvm](https://github.com/nvm-sh/nvm)
2. Install a node version using nvm
   ```
   $ nvm install 20.20.0
   ```
3. Set the node version for this current root directory
   ```
   $ cd frontend
   $ nvm use 20.20.0
   ```
4. In the root directory we install the required dependencies
   ```
   $ cd frontend
   $ npm install
   ```

**Run the frontend**
```
$ cd frontend
$ npm run dev
```

Frontend runs on http://localhost:5173 and backend on http://localhost:3000.  
Refer to backend/README.md for the backend.
