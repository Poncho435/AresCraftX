// supabase.js
const SUPABASE_URL = 'https://rzokuqhtzfxlbbxrftye.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6b2t1cWh0emZ4bGJieHJmdHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTYyOTUsImV4cCI6MjA4NDA3MjI5NX0.m6sl8W75qqfw_b07fT_EFkkYis5R8W5sg-mvNDlItOc';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

class Database {
    // ============ ПОЛЬЗОВАТЕЛИ ============
    
    // Получить текущего пользователя
    static async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    }
    
    // Получить профиль пользователя
    static async getUserProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error);
        }
        
        return data;
    }
    
    // Создать или обновить профиль
    static async upsertProfile(profileData) {
        const { data, error } = await supabase
            .from('profiles')
            .upsert(profileData)
            .select()
            .single();
        
        if (error) {
            console.error('Error upserting profile:', error);
            throw error;
        }
        
        return data;
    }
    
    // Обновить аватар
    static async updateAvatar(userId, avatarUrl) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ avatar_url: avatarUrl })
            .eq('id', userId)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating avatar:', error);
            throw error;
        }
        
        return data;
    }
    
    // Загрузить изображение в хранилище
    static async uploadImage(file, userId) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
            });
        
        if (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
        
        // Получаем публичный URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
        
        return publicUrl;
    }
    
    // ============ ДРУЗЬЯ ============
    
    // Получить все заявки в друзья
    static async getFriendRequests(userId) {
        const { data, error } = await supabase
            .from('friend_requests')
            .select(`
                *,
                sender:profiles!friend_requests_sender_id_fkey(*),
                receiver:profiles!friend_requests_receiver_id_fkey(*)
            `)
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .eq('status', 'pending');
        
        if (error) {
            console.error('Error fetching friend requests:', error);
            throw error;
        }
        
        return data;
    }
    
    // Отправить заявку в друзья
    static async sendFriendRequest(senderId, receiverUsername) {
        // Сначала находим пользователя по username
        const { data: receiver, error: findError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', receiverUsername)
            .single();
        
        if (findError || !receiver) {
            throw new Error('Пользователь не найден');
        }
        
        // Проверяем, не отправили ли уже заявку
        const { data: existingRequest } = await supabase
            .from('friend_requests')
            .select('*')
            .eq('sender_id', senderId)
            .eq('receiver_id', receiver.id)
            .single();
        
        if (existingRequest) {
            throw new Error('Заявка уже отправлена');
        }
        
        // Создаем заявку
        const { data, error } = await supabase
            .from('friend_requests')
            .insert({
                sender_id: senderId,
                receiver_id: receiver.id,
                status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) {
            console.error('Error sending friend request:', error);
            throw error;
        }
        
        return data;
    }
    
    // Принять заявку в друзья
    static async acceptFriendRequest(requestId) {
        // Обновляем статус заявки
        const { data: request, error: updateError } = await supabase
            .from('friend_requests')
            .update({ status: 'accepted', accepted_at: new Date().toISOString() })
            .eq('id', requestId)
            .select()
            .single();
        
        if (updateError) {
            console.error('Error accepting friend request:', updateError);
            throw updateError;
        }
        
        // Создаем запись в friends
        const { data: friendship, error: friendError } = await supabase
            .from('friends')
            .insert({
                user_id: request.receiver_id,
                friend_id: request.sender_id,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (friendError) {
            console.error('Error creating friendship:', friendError);
            throw friendError;
        }
        
        return { request, friendship };
    }
    
    // Отклонить заявку в друзья
    static async rejectFriendRequest(requestId) {
        const { data, error } = await supabase
            .from('friend_requests')
            .update({ status: 'rejected' })
            .eq('id', requestId)
            .select()
            .single();
        
        if (error) {
            console.error('Error rejecting friend request:', error);
            throw error;
        }
        
        return data;
    }
    
    // Получить список друзей
    static async getFriends(userId) {
        const { data, error } = await supabase
            .from('friends')
            .select(`
                *,
                friend:profiles!friends_friend_id_fkey(*)
            `)
            .eq('user_id', userId);
        
        if (error) {
            console.error('Error fetching friends:', error);
            throw error;
        }
        
        return data.map(item => item.friend);
    }
    
    // Удалить друга
    static async removeFriend(userId, friendId) {
        // Удаляем из обеих сторон
        const { error: error1 } = await supabase
            .from('friends')
            .delete()
            .eq('user_id', userId)
            .eq('friend_id', friendId);
        
        const { error: error2 } = await supabase
            .from('friends')
            .delete()
            .eq('user_id', friendId)
            .eq('friend_id', userId);
        
        if (error1 || error2) {
            console.error('Error removing friend:', error1 || error2);
            throw error1 || error2;
        }
        
        return true;
    }
    
    // ============ СТАТИСТИКА ============
    
    // Сохранить время чтения
    static async saveReadingTime(userId, bookId, minutes) {
        const today = new Date().toISOString().split('T')[0];
        
        // Проверяем, есть ли запись на сегодня
        const { data: existingRecord } = await supabase
            .from('reading_stats')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .single();
        
        if (existingRecord) {
            // Обновляем существующую запись
            const { data, error } = await supabase
                .from('reading_stats')
                .update({ 
                    minutes: existingRecord.minutes + minutes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingRecord.id)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } else {
            // Создаем новую запись
            const { data, error } = await supabase
                .from('reading_stats')
                .insert({
                    user_id: userId,
                    book_id: bookId,
                    date: today,
                    minutes: minutes,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();
            
            if (error) throw error;
            return data;
        }
    }
    
    // Получить статистику чтения
    static async getReadingStats(userId, period = 'month') {
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'day':
                startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
                break;
            default:
                startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
        }
        
        const { data, error } = await supabase
            .from('reading_stats')
            .select('*')
            .eq('user_id', userId)
            .gte('date', startDate.split('T')[0])
            .order('date', { ascending: false });
        
        if (error) {
            console.error('Error fetching reading stats:', error);
            throw error;
        }
        
        // Подсчитываем общее время
        const totalMinutes = data.reduce((sum, record) => sum + record.minutes, 0);
        
        return {
            records: data,
            totalMinutes: totalMinutes,
            dailyAverage: totalMinutes / Math.max(data.length, 1)
        };
    }
    
    // Получить серию дней чтения
    static async getReadingStreak(userId) {
        const { data, error } = await supabase
            .from('reading_stats')
            .select('date')
            .eq('user_id', userId)
            .order('date', { ascending: false });
        
        if (error) {
            console.error('Error fetching streak:', error);
            throw error;
        }
        
        // Вычисляем серию дней
        let streak = 0;
        let currentDate = new Date();
        
        for (const record of data) {
            const recordDate = new Date(record.date);
            const diffDays = Math.floor((currentDate - recordDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === streak) {
                streak++;
            } else {
                break;
            }
            
            currentDate.setDate(currentDate.getDate() - 1);
        }
        
        return streak;
    }
    
    // ============ КНИГИ ============
    
    // Добавить закладку
    static async addBookmark(userId, bookId, chapter, text) {
        const { data, error } = await supabase
            .from('bookmarks')
            .insert({
                user_id: userId,
                book_id: bookId,
                chapter: chapter,
                text: text,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) {
            console.error('Error adding bookmark:', error);
            throw error;
        }
        
        return data;
    }
    
    // Получить закладки пользователя
    static async getBookmarks(userId, bookId = null) {
        let query = supabase
            .from('bookmarks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (bookId) {
            query = query.eq('book_id', bookId);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Error fetching bookmarks:', error);
            throw error;
        }
        
        return data;
    }
    
    // Удалить закладку
    static async removeBookmark(bookmarkId) {
        const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('id', bookmarkId);
        
        if (error) {
            console.error('Error removing bookmark:', error);
            throw error;
        }
        
        return true;
    }
    
    // ============ ПОИСК ============
    
    // Поиск пользователей
    static async searchUsers(query, excludeUserId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
            .neq('id', excludeUserId)
            .limit(10);
        
        if (error) {
            console.error('Error searching users:', error);
            throw error;
        }
        
        return data;
    }
    
    // Проверить, являются ли пользователи друзьями
    static async checkFriendship(userId, friendId) {
        const { data, error } = await supabase
            .from('friends')
            .select('*')
            .eq('user_id', userId)
            .eq('friend_id', friendId)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error('Error checking friendship:', error);
        }
        
        return !!data;
    }
    
    // Проверить, есть ли активная заявка
    static async checkFriendRequest(senderId, receiverId) {
        const { data, error } = await supabase
            .from('friend_requests')
            .select('*')
            .eq('sender_id', senderId)
            .eq('receiver_id', receiverId)
            .eq('status', 'pending')
            .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error('Error checking friend request:', error);
        }
        
        return data;
    }
}

window.Database = Database;