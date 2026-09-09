// API references can be populated documents, plain ObjectIds, or strings.
// Keeping this conversion here prevents each screen from inventing a slightly
// different task-ownership rule.
export const getEntityId = (value) => {
    const id = value?._id || value?.id || value;
    return id?.toString?.() || id || null;
};

export const isTaskAssignedToUser = (task, user) => {
    const assignedUserId = getEntityId(task?.assignedTo);
    const currentUserId = getEntityId(user);

    return Boolean(assignedUserId) &&
        Boolean(currentUserId) &&
        assignedUserId === currentUserId;
};

export const isPendingTaskForUser = (task, user) =>
    task?.status === "PENDING" &&
    isTaskAssignedToUser(task, user);
