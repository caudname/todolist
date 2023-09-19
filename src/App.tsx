import React, { useState, useRef } from 'react';
import { Theme, presetGpnDefault } from '@consta/uikit/Theme';
import { PrimeReactProvider } from 'primereact/api';
import { Button } from '@consta/uikit/Button';
import { IconAdd } from '@consta/uikit/IconAdd';
import { HeaderModule, HeaderLogo } from '@consta/uikit/Header';
import { Text } from '@consta/uikit/Text';
import { Modal } from '@consta/uikit/Modal';
import { TextField } from '@consta/uikit/TextField';
import { Select } from '@consta/uikit/Select';
import Todolist, { TasksType } from './modules/components/Todolist';
import './App.css';
import { v1 } from 'uuid';
import { DatePicker } from '@consta/uikit/DatePicker';

type Todolist = {
  id: string,
  label: string,
  tasks: Array<TasksType>,
  color: string,
  order: number
}

const App = () => {
  // Получение стадий из localStorage
  let [todolists, setTodolists] = useState<Array<Todolist>>(() => {
    let store: Array<Todolist> = [];
    Object.keys(localStorage).forEach(key => { if (key.includes("todolist")) store.push(JSON.parse(localStorage.getItem(key) || "")); })
    store.sort((a, b) => a.order > b.order ? 1 : -1);
    return store;
  });
  // State модальных окон
  const [isTodolistModalOpen, setIsTodolistModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // State ошибки незаполненных полей при добавлении новых задач и стадий
  let [errorAddTodolist, setErrorAddTodolist] = useState<string | null>(null);
  let [errorAddTask, setErrorAddTask] = useState<string | null>(null);

  // State полей при добавлении новых задач и стадий
  const [color, setColor] = useState("ffffff");
  const [newTodolistName, setNewTodolistName] = useState<string>("");
  const [newTaskName, setNewTaskName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [completeDate, setCompleteDate] = useState<Date | null>(null);
  const [selectedItem, setSelectedItem] = useState<Todolist | null>(null);

  // Изменение текстовых полей ввода
  const handleNewTodolistChange = ({ value }: { value: string | null }) => { if (value) { setNewTodolistName(value.substring(0, 255)); setErrorAddTodolist(null); } else { setNewTodolistName("") } };
  const handleNewTaskChange = ({ value }: { value: string | null }) => { if (value) { setNewTaskName(value.substring(0, 255)); setErrorAddTask(null); } else { setNewTaskName(""); } };
  const handleDescriptionChange = ({ value }: { value: string | null }) => { if (value) { setDescription(value.substring(0, 1024)); setErrorAddTask(null); } else { setDescription(""); } };

  // Добавление новой стадии
  const addTodolist = () => {
    if (newTodolistName.trim() !== "") {
      let newTodolist = {
        id: v1(),
        label: newTodolistName,
        tasks: [],
        color: color,
        order: 0
      }
      todolists = [newTodolist, ...todolists];
      setNewTodolistName("");
      todolists.forEach((todolist, index) => {
        todolist.order = index;
        localStorage.setItem("todolist" + todolist.id, JSON.stringify(todolist));
      })
      localStorage.setItem("todolist" + newTodolist.id, JSON.stringify(newTodolist));
      setTodolists(todolists);
      setIsTodolistModalOpen(false);
    } else {
      setErrorAddTodolist("Поле не заполнено!");
    }
  }

  // Удаление стадии
  const removeTodolist = (todolistId: string) => {
    localStorage.removeItem("todolist" + todolistId);
    let updatedTodolists = todolists.filter(todolist => todolist.id !== todolistId)
    updatedTodolists.forEach((todolist, index) => {
      todolist.order = index;
      localStorage.setItem("todolist" + todolist.id, JSON.stringify(todolist));
    })
    setTodolists(updatedTodolists);
  }

  // Добавление новой задачи
  const addTask = (newTask: TasksType, todolistId: string) => {
    let foundedTodolist = todolists.find(todolist => todolist.id == todolistId);
    if (foundedTodolist) {
      foundedTodolist.tasks.push(newTask);
      localStorage.setItem("todolist" + foundedTodolist?.id, JSON.stringify(foundedTodolist));
    }
    setTodolists([...todolists]);
    setIsTaskModalOpen(false);
  }

  // Удаление задачи
  const removeTask = (taskId: string, todolistId: string) => {
    let updatedTodolist = todolists.find(todolist => todolist.id === todolistId);
    if (updatedTodolist) updatedTodolist.tasks = updatedTodolist.tasks.filter(task => task.id !== taskId);
    localStorage.setItem("todolist" + todolistId, JSON.stringify(updatedTodolist));
    setTodolists([...todolists]);
  }

  // Переключение (чекбоксов) статуса выполнения задачи
  const taskHandler = (taskId: string, todolistId: string, isDone: boolean) => {
    let foundedTodolist = todolists.find(todolist => todolist.id == todolistId);
    if (foundedTodolist) {
      let foundedTask = foundedTodolist.tasks.find(task => task.id === taskId);
      if (foundedTask) foundedTask.isDone = isDone;
      localStorage.setItem("todolist" + foundedTodolist?.id, JSON.stringify(foundedTodolist));
      setTodolists([...todolists]);
    }
  }

  // Изменение фонового цвета стадии
  const changeColor = (todolistId: string, color: string) => {
    let foundedTodolist = todolists.find(todolist => todolist.id == todolistId);
    if (foundedTodolist) {
      foundedTodolist.color = color;
      localStorage.setItem("todolist" + foundedTodolist.id, JSON.stringify(foundedTodolist));
    }
    setTodolists([...todolists]);
  }

  // Элементы при перетаскивании
  let dragItem = useRef<any>(null);
  let dragOverItem = useRef<any>(null);

  // Перетаскивание стадий
  const handleSort = () => {
    let _todolists = [...todolists];
    const draggedItemContent = _todolists.splice(dragItem.current, 1)[0];
    _todolists.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    _todolists.forEach((todolist, index) => {
      todolist.order = index;
      localStorage.setItem("todolist" + todolist.id, JSON.stringify(todolist));
    })
    setTodolists([..._todolists]);
  }

  return (
    <PrimeReactProvider>
      <Theme preset={presetGpnDefault}>
        <HeaderModule className='headermodule'>
          <HeaderLogo>
            <Text as="p" size="l" weight="bold" className='logo'>
              Todolist
            </Text>
          </HeaderLogo>
        </HeaderModule>
        <div className="container">
          <div className="add__buttons-block">
            <Button
              iconRight={IconAdd}
              label="Добавить стадию"
              onClick={() => { setIsTodolistModalOpen(true); }}
              className="add__buttons"
            />
            <Button
              iconRight={IconAdd}
              label="Добавить задачу"
              onClick={() => { setIsTaskModalOpen(true); }}
              className="add__buttons"
            />
          </div>
          {/* Модальное окно новой стадии */}
          <Modal
            isOpen={isTodolistModalOpen}
            hasOverlay
            onClickOutside={() => setIsTodolistModalOpen(false)}
            onEsc={() => setIsTodolistModalOpen(false)}
          >
            <div className="modal__window">
              <Text as="p" size="m" view="secondary">
                Введите название стадии
              </Text>
              <TextField
                type="text"
                value={newTodolistName}
                onChange={handleNewTodolistChange}
                style={{ marginBottom: "10px" }}
                className={errorAddTodolist ? "error" : ""}
              />
              {errorAddTodolist && <div className="error-message">{errorAddTodolist}</div>}

              <div>
                <Button
                  label="Добавить стадию"
                  onClick={addTodolist}
                  style={{ marginRight: "10px" }}
                />
                <Button
                  size="m"
                  view="primary"
                  label="Закрыть"
                  width="default"
                  onClick={() => { setIsTodolistModalOpen(false); setErrorAddTodolist(null); }}
                />
              </div>
            </div>
          </Modal>
          {/* Модальное окно новой задачи */}
          <Modal
            isOpen={isTaskModalOpen}
            hasOverlay
            onClickOutside={() => setIsTaskModalOpen(false)}
            onEsc={() => setIsTaskModalOpen(false)}
          >
            <div className='modal__window'>
              <Text as="p" size="m" view="secondary">
                Введите новую задачу
              </Text>
              <TextField
                type="text"
                value={newTaskName}
                onChange={handleNewTaskChange}
                className={!newTaskName && errorAddTask ? "error" : ""}
              />
              {!newTaskName && errorAddTask ? <div className="error-message">{errorAddTask}</div> : ""}
              <Text as="p" size="m" view="secondary">
                Введите описание задачи
              </Text>
              <TextField
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Описание"
                type="textarea"
                cols={200}
                rows={3}
                className={!description && errorAddTask ? "error" : ""}
              />
              {!description && errorAddTask ? <div className="error-message">{errorAddTask}</div> : ""}
              <Select
                label="Выберите стадию"
                placeholder="Выберите"
                items={todolists}
                value={selectedItem}
                onChange={(selectedItem) => { setSelectedItem(selectedItem.value); setErrorAddTask(null); }}
                className={!selectedItem && errorAddTask ? "error" : ""}
              />
              {!selectedItem && errorAddTask ? <div className="error-message">{errorAddTask}</div> : ""}
              <Text as="p" size="m" view="secondary">
                Дата завершения
              </Text>
              <DatePicker
                type="date"
                value={completeDate}
                onChange={({ value }) => { setCompleteDate(value); setErrorAddTask(null); }}
                withClearButton
                style={{ marginBottom: "10px" }}
                className={!completeDate && errorAddTask ? "error" : ""}
              />
              {!completeDate && errorAddTask ? <div className="error-message">{errorAddTask}</div> : ""}
              <div>
                <Button
                  label="Добавить задачу"
                  style={{ marginRight: "10px" }}
                  onClick={() => {
                    if (selectedItem && completeDate && newTaskName && description) {
                      addTask({ id: v1(), title: newTaskName, description: description, date: completeDate, isDone: false }, selectedItem.id)
                      setSelectedItem(null);
                      setNewTaskName("");
                      setDescription("");
                      setCompleteDate(null);
                    } else {
                      setErrorAddTask("Поле не заполнено!");
                    }
                  }}
                />
                <Button
                  size="m"
                  view="primary"
                  label="Закрыть"
                  width="default"
                  onClick={() => { setIsTaskModalOpen(false); setErrorAddTask(null); }}
                />
              </div>
            </div>
          </Modal>
          {/* Map todolists */}
          <div className="todolists">
            {
              todolists.map((todolist, index) => {
                return <Todolist
                  id={todolist.id}
                  key={todolist.id}
                  label={todolist.label}
                  tasks={todolist.tasks}
                  color={todolist.color}
                  index={index}
                  addTask={addTask}
                  removeTask={removeTask}
                  removeTodolist={removeTodolist}
                  taskHandler={taskHandler}
                  changeColor={changeColor}
                  onDragStart={(e) => (dragItem.current = index)}
                  onDragEnter={(e) => (dragOverItem.current = index)}
                  onDragEnd={handleSort}
                  onDragOver={(e) => e.preventDefault()}
                />
              })
            }
          </div>
        </div>
      </Theme>
    </PrimeReactProvider>
  );
}

export default App;
