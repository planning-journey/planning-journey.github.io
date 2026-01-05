# 2026-01-05 - TaskItem Three Dots Removal and Task Editor Modal Implementation

## Description
The user requested the following changes to the task management functionality:
1.  Remove the "three dots" (ellipsis) icon from `TaskItem`.
2.  Make the `TaskItem` clickable to open a task editing modal.
3.  The task editing modal should allow modifying:
    *   Task name
    *   Task description
    *   Task date (using a calendar component)
    *   Task goal (using an autocomplete component for goals, which was implemented as a dropdown for now).

## Changes Made

1.  **`src/components/TaskEditorModal.tsx` created:**
    *   A new modal component `TaskEditorModal` was created to handle the editing of task details.
    *   It includes input fields for task `text` (name) and `description`.
    *   Integrates the existing `Calendar` component for `dueDate` selection.
    *   Provides a dropdown for selecting an associated `goalId` from available goals fetched from the database.
    *   Handles saving updated task data to the Dexie database (`db.tasks.put`).

2.  **`src/components/TaskItem.tsx` modified:**
    *   The `MoreVertical` icon, its associated button, and the dropdown menu functionality were removed.
    *   The main `div` of the `TaskItem` was made clickable, and its `onClick` handler now calls the `onEdit` prop, passing the current `task` object.
    *   The `useState` import was re-added after an `Uncaught ReferenceError` was reported, which occurred because `useState` was inadvertently removed during previous modifications.

3.  **`src/components/TaskList.tsx` modified:**
    *   `TaskEditorModal` was imported.
    *   Internal state (`isTaskEditorModalOpen`, `taskToEdit`) was added to manage the visibility and data of the `TaskEditorModal`.
    *   The `onEdit` prop passed to `TaskItem` now triggers the internal `handleEditTask` function, which sets `taskToEdit` and opens the modal.
    *   A `handleSaveTask` function was implemented to receive updated tasks from `TaskEditorModal` and persist them to the database.
    *   The `onEditTask` prop was removed from `TaskListProps` as the modal handling is now internal to `TaskList`.

4.  **`src/components/DailyDetailArea.tsx` modified:**
    *   `TaskEditorModal` was imported.
    *   Internal state (`isTaskEditorModalOpen`, `taskToEdit`) was added to manage the visibility and data of the `TaskEditorModal`.
    *   The `handleEditTask` function was updated to set the `taskToEdit` and open the `TaskEditorModal`.
    *   A `handleSaveEditedTask` function was implemented to handle saving the updated task to the database when the modal is closed.
    *   `TaskEditorModal` is now rendered within `DailyDetailArea`, passing the `isOpen`, `onClose`, `taskToEdit`, and `onSave` props.

## Verification
(Instructions provided to the user)
The user is instructed to run the application, add a task, click on it to open the editor, modify its details, save, and then verify the changes are reflected in the UI and persist across application reloads.
