#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
import showBanner from "node-banner";
import { createSpinner } from "nanospinner";

let wait = (time = 2000) => new Promise((r) => setTimeout(r, time));

interface Todos {
    todo: string,
    completed: boolean
}

let todos: Todos[] = [];

async function showMyBanner() {
    await showBanner(
        "Todo List",
        "You can add your tasks and update their status."
    );
}

async function options(): Promise<{ userOption: string }> {
    let { userOption } = await inquirer.prompt({
        name: "userOption",
        type: "list",
        choices: ["Add Todo", "Remove Todo", "Display Todos"],
        message: chalk.rgb(100, 220, 160)("What do you want to do: ")
    });

    return { userOption };
}


async function addTodo(): Promise<{ input: string }> {
    let input: string;
    while (true) {
        let { userTodo } = await inquirer.prompt({
            name: "userTodo",
            type: "input",
            message: chalk.rgb(180, 0, 30)("Enter Todo")
        });

        input = await userTodo;
        if (input.trim()) {
            let spinner = createSpinner(chalk.rgb(220, 180, 120)("Adding Todo...")).start();
            await wait();
            todos.push({ todo: input, completed: false });
            spinner.success({ text: chalk.greenBright("Todo added successfully.") });

            break;
        } else {
            console.log(chalk.red("Please enter a valid todo item (no spaces only)"))
        }
    }


    return { input }


}


async function removeTodo() {
    if (!todos.length) {
        console.log(chalk.yellowBright("No todos found! Use the 'Add Todo' option to fill your list"));
        return;
    };

    let { removedTodo } = await inquirer.prompt({
        name: "removedTodo",
        type: "list",
        choices: todos.map((item) => item.todo),
        message: chalk.rgb(180, 0, 30)("Select Todo: ")
    });

    let removeTodoIndex = todos.findIndex((todo) => todo.todo === removedTodo);

    let spinner = createSpinner(chalk.rgb(220, 180, 120)("Deleting Todo...")).start();
    await wait();

    if (removeTodoIndex !== -1) {
        todos.splice(removeTodoIndex, 1);
        spinner.success({ text: chalk.greenBright("Todo deleted succesfully!") });

    } else {
        console.log(chalk.red("Todo not found!"));
    }

};

async function todoStatus(todo: Todos): Promise<void> {

    console.log(`Todo: ${todo.todo}`);
    console.log(`Status: ${todo.completed ? chalk.greenBright("Completed") : chalk.red("Not Completed")}`);

    if (!todo.completed) {
        let { statusInput } = await inquirer.prompt([{
            name: "statusInput",
            type: "confirm",
            message: chalk.yellowBright("Do you want to complete it?")
        }]);

        if (statusInput) {
            todo.completed = true;
            const spinner = createSpinner(chalk.rgb(220, 180, 120)("updating status...")).start();
            await wait();
            spinner.success({ text: chalk.greenBright(`Todo ${todo.todo} updated to completed. Successfully!`) });
        }
    }
}


async function displayTodo() {
    if (!todos.length) {
        console.log(chalk.yellowBright("No todos found! Use the 'Add Todo' option to fill your list"));
        return;
    };

    let { selectedTodo } = await inquirer.prompt({
        name: "selectedTodo",
        type: "list",
        choices: todos.map((item) => item.todo)
    });

    let todoObj = todos.find((item) => item.todo === selectedTodo);
    if (!todoObj) {
        console.log(chalk.red("Todo not found!!"));
        return;
    }
    await todoStatus(todoObj);

}


async function exit(): Promise<boolean> {
    let { playAgain } = await inquirer.prompt({
        name: "playAgain",
        type: "confirm",
        message: chalk.rgb(220, 110, 0)("Do you want to exit?")
    });

    return playAgain
}

(async function todoFunction() {
    await showMyBanner();
    await wait(1000);

    let playAgain = false;

    while (!playAgain) {
        let { userOption } = await options();

        if (userOption === "Add Todo") {
            await addTodo();
        } else if (userOption === "Remove Todo") {
            await removeTodo();
        } else if (userOption === "Display Todos") {
            await displayTodo();
        }

        playAgain = await exit();
    }
})();
