import { useState, useCallback, useEffect } from 'react';
import { TaskProjectDevisionService } from '../services/taskProjectDevisionService';
import { TaskProjectDevision, TaskProjectDevisionRequest } from '../types/taskProjectDevision';
import toast from 'react-hot-toast';

export const useTaskProjectDevision = (project_detail_devision_id: string) => {
    const [tasks, setTasks] = useState<TaskProjectDevision[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [searchValue, setSearchValue] = useState('');

    const fetchTasks = useCallback(async (pageStr?: number, limitStr?: number, searchStr?: string) => {
        setLoading(true);
        setError(null);
        try {
            const page = pageStr || pagination.page;
            const limit = limitStr || pagination.limit;
            const search = searchStr !== undefined ? searchStr : searchValue;

            const response = await TaskProjectDevisionService.getTasks({
                project_detail_devision_id,
                page,
                limit,
                search
            });

            if (response.success) {
                setTasks(response.data);
                if (response.pagination) {
                    setPagination(response.pagination);
                }
            } else {
                setError('Failed to fetch tasks');
            }
        } catch (err: any) {
            setError(err?.message || 'Error fetching tasks');
        } finally {
            setLoading(false);
        }
    }, [project_detail_devision_id, pagination.page, pagination.limit, searchValue]);

    useEffect(() => {
        if (project_detail_devision_id) {
            fetchTasks(1);
        }
    }, [project_detail_devision_id]);

    const handleCreateTask = async (data: TaskProjectDevisionRequest) => {
        try {
            await TaskProjectDevisionService.createTask(data);
            toast.success('Task created successfully');
            fetchTasks();
            return true;
        } catch (err: any) {
            toast.error(err?.message || 'Failed to create task');
            return false;
        }
    };

    const handleUpdateTask = async (id: string, data: TaskProjectDevisionRequest) => {
        try {
            await TaskProjectDevisionService.updateTask(id, data);
            toast.success('Task updated successfully');
            fetchTasks();
            return true;
        } catch (err: any) {
            toast.error(err?.message || 'Failed to update task');
            return false;
        }
    };

    const handleDeleteTask = async (id: string) => {
        try {
            await TaskProjectDevisionService.deleteTask(id);
            toast.success('Task deleted successfully');
            fetchTasks();
            return true;
        } catch (err: any) {
            toast.error(err?.message || 'Failed to delete task');
            return false;
        }
    };

    const handlePageChange = (page: number) => {
        fetchTasks(page);
    };

    const handleRowsPerPageChange = (newPerPage: number, page: number) => {
        fetchTasks(page, newPerPage);
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);
        fetchTasks(1, pagination.limit, value);
    };

    return {
        tasks,
        loading,
        error,
        pagination,
        searchValue,
        fetchTasks,
        handleCreateTask,
        handleUpdateTask,
        handleDeleteTask,
        handlePageChange,
        handleRowsPerPageChange,
        handleSearch
    };
};
