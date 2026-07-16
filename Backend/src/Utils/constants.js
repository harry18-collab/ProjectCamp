export const UserRolesENUM={
    ADMIN:"admin",
    PROJECT_ADMIN:"project_admin",
    MEMBER:"member"
}

export const AvailableUserRoles=Object.values(UserRolesENUM)

export const TaskRolesENUM={
    TODO:"todo",
    IN_PROGRESS:"in_progress",
    DONE:"done"
}

export const AvailableTaskStatues=Object.values(TaskRolesENUM);