# propsearch-rails-app backend

## Development Environment Setup

- NOTE: All commands should be ran in the root directory unless otherwise specified

**Installing Ruby**
1. Install [rbenv](https://github.com/rbenv/rbenv)
2. Install a Ruby version using rbenv
   ```
   $ rbenv install 3.2.2
   ```
3. Set the Ruby version for this current root directory
   ```
   $ cd backend
   $ rbenv local 3.2.2
   ```
4. In the root directory we install the required Gems
   ```
   $ cd backend
   $ bundle install
   ```

**DB Migration**
Setup the db migration and seed
```
$ cd backend
$ rails db:migrate
$ rails db:seed
```

**Run the backend**
```
$ cd backend
$ rails s
```

**Running the test**  
Run the rspec test
```
$ cd backend
$ bundle exec rspec
```

**Demo Account**  
After seeding:
```
Demo Account
Email: demo@landchecker.com
Password: password123
```
