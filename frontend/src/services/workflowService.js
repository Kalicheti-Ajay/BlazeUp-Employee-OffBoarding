import api from "./api";

// Canonical client contract for GET /workflows/:id. All task-driven screens
// consume this function rather than interpreting Axios response shapes locally.
const normalizeWorkflowDetails = (payload) => ({
    workflow: payload?.workflow || null,
    tasks: Array.isArray(payload?.tasks) ? payload.tasks : [],
    auditLogs: Array.isArray(payload?.auditLogs) ? payload.auditLogs : []
});

/*
|--------------------------------------------------------------------------
| Workflow Templates
|--------------------------------------------------------------------------
*/

export const getWorkflowTemplates = async () => {
    const response = await api.get(
        "/workflow-templates"
    );

    return response.data.templates || [];
};


/*
|--------------------------------------------------------------------------
| Start Workflow
|--------------------------------------------------------------------------
*/

export const startWorkflow = async (data) => {
    const response = await api.post(
        "/workflows/start",
        data
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Get Workflow Details
|--------------------------------------------------------------------------
*/

export const getWorkflowDetails = async (workflowId) => {
    if (!workflowId) {
        throw new Error(
            "Workflow ID is required"
        );
    }

    const response = await api.get(
        `/workflows/${workflowId}`
    );

    return normalizeWorkflowDetails(response.data);
};


/*
|--------------------------------------------------------------------------
| Approve Task
|--------------------------------------------------------------------------
*/

export const approveTask = async (
    taskId,
    data = {}
) => {
    if (!taskId) {
        throw new Error(
            "Task ID is required"
        );
    }

    const response = await api.post(
        `/workflows/tasks/${taskId}/approve`,
        data
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Reject Task
|--------------------------------------------------------------------------
*/

export const rejectTask = async (
    taskId,
    data = {}
) => {
    if (!taskId) {
        throw new Error(
            "Task ID is required"
        );
    }

    const response = await api.post(
        `/workflows/tasks/${taskId}/reject`,
        data
    );

    return response.data;
};

export const revokeAccess = async (taskId, accessType) => {
    const response = await api.post(`/workflows/tasks/${taskId}/revoke-access`, { accessType });
    return response.data;
};
