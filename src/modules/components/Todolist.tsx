import React, { useState, ChangeEvent, KeyboardEvent, ChangeEventHandler, DragEvent, useEffect, useRef } from "react";
import { IconTrash } from '@consta/uikit/IconTrash';
import { ColorPicker, ColorPickerChangeEvent } from 'primereact/colorpicker';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import { IconAdd } from '@consta/uikit/IconAdd';
import { Button } from '@consta/uikit/Button';
import { TextField } from '@consta/uikit/TextField';
import { DatePicker } from '@consta/uikit/DatePicker';
import { Text } from '@consta/uikit/Text';
import { Checkbox } from '@consta/uikit/Checkbox';
import { Card } from '@consta/uikit/Card';
import { v1 } from 'uuid';

export type TasksType = {
    id: string,
    title: string,
    description: string,
    date: Date,
    isDone: boolean
}

interface TodolistProps {
    id: string,
    label: string,
    tasks: Array<TasksType>,
    color: string,
    index: number,
    addTask: (newTask: TasksType, todolistId: string) => void,
    removeTask: (taskId: string, todolistId: string) => void,
    removeTodolist: (todolistId: string) => void,
    taskHandler: (taskId: string, todolistId: string, isDone: boolean) => void,
    changeColor: (todolistId: string, color: string) => void,
    onDragStart: (e: any) => number,
    onDragEnd: () => void,
    onDragEnter: (e: any) => number,
    onDragOver: (e: any) => void
}

const Todolist = (props: TodolistProps) => {

    const [date, setDate] = useState<Date | null>(null);
    const [addTaskBlock, setAddTaskBlock] = useState<boolean>(false);
    let [tasks, setTasks] = useState<Array<TasksType>>([...props.tasks]);
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    useEffect(() => {
        setTasks(props.tasks);
    }, [props.tasks]);

    let [error, setError] = useState<string | null>(null);

    // Создание новой задачи
    const createTask = () => ({
        id: v1(),
        title: title,
        description: description,
        date: date ? date : new Date(),
        isDone: false
    })

    return (
        <div
            className="todolist"
            draggable={true}
            style={{ background: "#" + props.color }}
            onDragStart={props.onDragStart}
            onDragEnter={props.onDragEnter}
            onDragEnd={props.onDragEnd}
            onDragOver={props.onDragOver}
        >
            <Card verticalSpace="xs" horizontalSpace="xs" style={{ height: "100%" }}>
                <div>
                    <span className="todolist-label">{props.label}</span>
                    <ColorPicker
                        style={{ marginRight: "5px", position: "relative", top: "-5px" }}
                        format="hex"
                        value={props.color}
                        onChange={(e: ColorPickerChangeEvent) => { props.changeColor(props.id, String(e.value)); }}
                    />
                    <Button
                        iconRight={IconTrash}
                        onClick={() => { props.removeTodolist(props.id) }}
                    />
                </div>
                {/* Map tasks */}
                <ul className="tasks">
                    {
                        tasks.map(task => (
                            <Card verticalSpace="xs" horizontalSpace="xs" style={{ marginBottom: "10px" }} key={task.id}>
                                <li className="task">
                                    <Checkbox
                                        className="task__checkbox"
                                        size="l"
                                        checked={task.isDone}
                                        onChange={(object: { e: React.ChangeEvent<HTMLInputElement> }) => { props.taskHandler(task.id, props.id, object.e.currentTarget.checked); }}
                                    />
                                    <span className={task.isDone ? "task__title completed" : "task__title uncompleted"}>{task.title}</span>
                                    <Button iconRight={IconTrash} onClick={() => { props.removeTask(task.id, props.id) }} />
                                    <Text>{task.description}</Text>
                                    <Text>{String(task.date)}</Text>
                                </li>
                            </Card>
                        ))
                    }
                </ul>
                {/* Блок добавления новой задачи из стадии */}
                <div className={"add__task-block"}>
                    {addTaskBlock ?
                        <Card verticalSpace="xs" horizontalSpace="xs">
                            <div>
                                <TextField
                                    type="text"
                                    value={title}
                                    placeholder="Название"
                                    onChange={({ value }: { value: string | null }) => { if (value) { setTitle(value.substring(0, 255)); setError(null); } else { setTitle(""); } }}
                                    style={{ marginBottom: "5px" }}
                                    className={!title && error ? "error" : ""}
                                />
                                {!title && error ? <div className="error-message">{error}</div> : ""}
                                <TextField
                                    value={description}
                                    onChange={({ value }: { value: string | null }) => { if (value) { setDescription(value.substring(0, 1024)); setError(null); } else { setDescription(""); } }}
                                    placeholder="Описание"
                                    type="textarea"
                                    cols={200}
                                    rows={3}
                                    style={{ marginBottom: "5px" }}
                                    className={!description && error ? "error" : ""}
                                />
                                {!description && error ? <div className="error-message">{error}</div> : ""}
                                <DatePicker
                                    type="date-time"
                                    format='dd.MM.yyyy HH:mm:ss'
                                    value={date}
                                    onChange={({ value }) => { setDate(value); setError(null); }}
                                    withClearButton
                                    style={{ marginBottom: "5px", width: "100%" }}
                                    className={!date && error ? "error" : ""}
                                />
                                {!date && error ? <div className="error-message">{error}</div> : ""}
                                <Button
                                    iconRight={IconAdd}
                                    style={{ marginRight: "5px", position: "relative", top: "6px" }}
                                    onClick={() => {
                                        if (title && description && date) {
                                            props.addTask(createTask(), props.id);
                                            setAddTaskBlock(!addTaskBlock)
                                            setTitle("");
                                            setDescription("");
                                            setDate(null);
                                        }
                                        else {
                                            setError("Поле не заполнено!");
                                        }
                                    }} />
                                <Button
                                    label="Отмена"
                                    onClick={() => {
                                        setAddTaskBlock(!addTaskBlock); setError(null); setAddTaskBlock(!addTaskBlock);
                                        setTitle("");
                                        setDescription("");
                                        setDate(null);
                                    }}
                                />
                            </div>
                        </Card>
                        :
                        <Button
                            iconRight={IconAdd}
                            onClick={() => { setAddTaskBlock(!addTaskBlock) }}
                        />}
                </div>
            </Card>
        </div>
    );
}

export default Todolist;