import { defineStore } from 'pinia';
import { ADMIN_CREDENTIALS } from '@/constants/auth';

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    loading: false,
    error: null
  }),
  
  actions: {
    // Загрузка пользователей
    async loadUsers() {
      this.loading = true;
      this.error = null;
      
      try {
        // Изначальные пользователи по умолчанию
        let defaultUsers = [
          {
            id: 1,
            name: ADMIN_CREDENTIALS.name,
            email: ADMIN_CREDENTIALS.email,
            role: ADMIN_CREDENTIALS.role,
            password: ADMIN_CREDENTIALS.password  // Пароль администратора из констант
          },
          {
            id: 2,
            name: 'Иванов Иван',
            email: 'ivanov@example.com',
            role: 'manager',
            password: 'manager123'  // Пароль менеджера
          },
          {
            id: 3,
            name: 'Петров Петр',
            email: 'petrov@example.com',
            role: 'user',
            password: 'user123'  // Пароль обычного пользователя
          },
          {
            id: 4,
            name: 'Сидорова Елена',
            email: 'sidorova@example.com',
            role: 'user',
            password: 'user456'  // Пароль обычного пользователя
          }
        ];
        
        // Пробуем загрузить пользователей из database.json
        try {
          const response = await fetch('/data/database.json');
          
          if (response.ok) {
            const data = await response.json();
            if (data.users && Array.isArray(data.users) && data.users.length > 0) {
              defaultUsers = data.users;
            }
          }
        } catch (e) {
          // Обрабатываем ошибку без вывода в консоль
        }
        
        // Проверяем, сохранены ли уже пользователи в localStorage
        if (process.client) {
          const savedUsers = localStorage.getItem('smartsklad_users');
          
          if (savedUsers) {
            try {
              const parsedUsers = JSON.parse(savedUsers);
              
              if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
                // Проверяем, что у каждого пользователя есть пароль
                let needsUpdate = false;
                
                // Сначала создаем мапу для быстрого поиска по email
                const defaultUserMap = {};
                defaultUsers.forEach(user => {
                  defaultUserMap[user.email] = user.password;
                });
                
                // Теперь обновляем пользователей в localStorage
                parsedUsers.forEach(user => {
                  if (!user.password && defaultUserMap[user.email]) {
                    user.password = defaultUserMap[user.email];
                    needsUpdate = true;
                  }
                });
                
                // Если были обновления, сохраняем
                if (needsUpdate) {
                  localStorage.setItem('smartsklad_users', JSON.stringify(parsedUsers));
                }
                
                this.users = parsedUsers;
                
                // Проверяем наличие всех пользователей из database.json
                let updated = false;
                defaultUsers.forEach(defaultUser => {
                  const userExists = this.users.some(user => user.email === defaultUser.email);
                  if (!userExists) {
                    this.users.push(defaultUser);
                    updated = true;
                  }
                });
                
                // Сохраняем обновления, если были добавлены недостающие пользователи
                if (updated) {
                  this.saveUsersToLocalStorage();
                }
              } else {
                this.users = defaultUsers;
                this.saveUsersToLocalStorage();
              }
            } catch (e) {
              this.users = defaultUsers;
              this.saveUsersToLocalStorage();
            }
          } else {
            this.users = defaultUsers;
            this.saveUsersToLocalStorage();
          }
        } else {
          // Для серверного рендеринга используем defaultUsers
          this.users = defaultUsers;
        }
        
        return true;
      } catch (err) {
        this.error = err.message || 'Ошибка загрузки пользователей';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Добавление пользователя
    async addUser(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        // Проверяем, существует ли уже пользователь с таким email
        const existingUser = this.users.find(user => user.email === userData.email);
        if (existingUser) {
          throw new Error('Пользователь с таким email уже существует');
        }
        
        // Проверяем пароль
        if (!userData.password || userData.password.length < 6) {
          throw new Error('Пароль должен содержать не менее 6 символов');
        }
        
        // Добавляем нового пользователя
        this.users.push(userData);
        this.saveUsersToLocalStorage();
        
        return true;
      } catch (err) {
        this.error = err.message || 'Ошибка при добавлении пользователя';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Обновление пользователя
    async updateUser(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        // Находим индекс пользователя
        const userIndex = this.users.findIndex(user => user.id === userData.id);
        if (userIndex === -1) {
          throw new Error('Пользователь не найден');
        }
        
        // Проверяем, изменился ли email, и если да, то проверяем уникальность
        if (userData.email !== this.users[userIndex].email) {
          const existingUser = this.users.find(user => user.email === userData.email);
          if (existingUser) {
            throw new Error('Пользователь с таким email уже существует');
          }
        }
        
        // Проверяем пароль, если он был изменен
        if (userData.password) {
          if (userData.password.length < 6) {
            throw new Error('Пароль должен содержать не менее 6 символов');
          }
        } else {
          // Если пароль пустой, удаляем его из данных обновления,
          // чтобы сохранить старый пароль
          delete userData.password;
        }
        
        // Обновляем данные пользователя
        this.users[userIndex] = { ...this.users[userIndex], ...userData };
        this.saveUsersToLocalStorage();
        
        return true;
      } catch (err) {
        this.error = err.message || 'Ошибка при обновлении пользователя';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Удаление пользователя
    async deleteUser(userId) {
      this.loading = true;
      this.error = null;
      
      try {
        // Проверяем, не пытаемся ли удалить админа
        const userToDelete = this.users.find(user => user.id === userId);
        if (userToDelete?.email === ADMIN_CREDENTIALS.email) {
          throw new Error('Невозможно удалить основного администратора');
        }
        
        // Фильтруем массив пользователей
        this.users = this.users.filter(user => user.id !== userId);
        this.saveUsersToLocalStorage();
        
        return true;
      } catch (err) {
        this.error = err.message || 'Ошибка при удалении пользователя';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Сохранение пользователей в localStorage
    saveUsersToLocalStorage() {
      if (process.client) {
        localStorage.setItem('smartsklad_users', JSON.stringify(this.users));
      }
    }
  }
}); 