import express from "express";
import mongoose from "mongoose";
import xlsx from "xlsx";
import cors from "cors";

const paths = [
    {
        type: "Пользовательский",
        path: "../NSI_021.xlsx",
        name: "Классификатор цветов кузова транспортных средств, шасси транспортных средств, самоходных машин и других видов техники",
        dateFrom: "31.05.2021",
        dateTo: "01.01.3000",
    },
    {
        type: "Технологический",
        path: "../NSI_026.xlsx",
        name: "Перечень видов подвески транспортных средств, шасси транспортных средств, самоходных машин и других видов техники",
        dateFrom: "31.05.2021",
        dateTo: "01.01.3000",
    },
    {
        type: "Пользовательский",
        path: "../NSI_027.xlsx",
        name: "Перечень положений рулевого колеса относительно продольной оси транспортного средства, шасси транспортного средства, самоходной машины и других видов техники",
        dateFrom: "31.05.2021",
        dateTo: "01.01.3000",
    },
    {
        type: "Технологический",
        path: "../NSI_047.xlsx",
        name: "Расположение двигателя",
        dateFrom: "31.05.2021",
        dateTo: "01.01.3000",
    },
    {
        type: "Защищенный (классификатор)",
        path: "../NSI_054.xlsx",
        name: "Тип кузова",
        dateFrom: "31.05.2021",
        dateTo: "01.01.3000",
    },
];

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

const url =
    "mongodb+srv://Valeria:12345A@cluster0.qppxokg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

const models = [];

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Connect to DB");

    const Schema = mongoose.Schema;

    const dataSchema = new Schema({
        code: Number,
        ru_name: String,
        rb_name: String,
        dateFrom: {
            type: String,
            validate: {
                validator: function (v) {
                    return /^\d{2}\.\d{2}\.\d{4}$/.test(v);
                },
                message: (props) =>
                    `${props.value} is not a valid date format!`,
            },
        },
        dateTo: {
            type: String,
            validate: {
                validator: function (v) {
                    return /^\d{2}\.\d{2}\.\d{4}$/.test(v);
                },
                message: (props) =>
                    `${props.value} is not a valid date format!`,
            },
        },
    });

    paths.forEach((path, i) => {
        const name = path.path.slice(3);
        const DataModel = mongoose.model(
            "DataModel",
            dataSchema,
            name.slice(0, name.length - 5)
        );
        models.push({
            model: DataModel,
            type: path.type,
            index: i,
            name: path.name,
            code: name.slice(4, name.length - 5),
            dateFrom: path.dateFrom,
            dateTo: path.dateTo,
        });
        const workbook = xlsx.readFile(path.path);
        const sheet_name_list = workbook.SheetNames;
        const data = xlsx.utils.sheet_to_json(
            workbook.Sheets[sheet_name_list[0]]
        );
        const objects = [];
        data.slice(1).forEach((el) => {
            objects.push(el);
        });

        //     objects.forEach((obj) => {
        //         const transformedObject = {
        //             code: Number(
        //                 obj[
        //                     "Справочник: Классификатор цветов кузова транспортных средств, шасси транспортных средств, самоходных машин и других видов техники"
        //                 ] ||
        //                     obj[
        //                         "Справочник: Перечень видов подвески транспортных средств, шасси транспортных средств, самоходных машин и других видов техники"
        //                     ] ||
        //                     obj[
        //                         "Справочник: Перечень положений рулевого колеса относительно продольной оси транспортного средства, шасси транспортного средства, самоходной машины и других видов техники"
        //                     ] ||
        //                     obj["Справочник: Расположение двигателя"] ||
        //                     obj["Справочник: Тип кузова"]
        //             ),
        //             ru_name: obj.__EMPTY,
        //             rb_name: obj.__EMPTY_1,
        //             dateFrom: new Date(
        //                 (obj.__EMPTY_2 - (25567 + 2)) * 86400 * 1000
        //             ).toLocaleDateString("ru-RU"),
        //             dateTo: new Date(
        //                 (obj.__EMPTY_3 - (25567 + 2)) * 86400 * 1000
        //             ).toLocaleDateString("ru-RU"),
        //         };

        //         async function saveData() {
        //             try {
        //                 const dataInstance = new DataModel(transformedObject);
        //                 await dataInstance.save();
        //             } catch (err) {
        //                 console.error("Ошибка при сохранении:", err);
        //             }
        //         }

        //         saveData();
        //     });
    });
});

app.listen(PORT, (error) => {
    console.log(error ? error : `Listening port ${PORT}`);
});

async function getData(model) {
    try {
        const data = await model.model.find({});
        return data;
    } catch (err) {
        console.error("Ошибка при получении данных:", err);
        return null;
    }
}

app.get("/types", (req, res) => {
    const types = [...new Set(models.map((el) => el.type))];
    res.send(types);
});

app.get("/names", (req, res) => {
    const names = [...new Set(models.map((el) => el.name))];
    res.send(names);
});

app.get("/codes", (req, res) => {
    const codes = [...new Set(models.map((el) => el.code))];
    res.send(codes);
});

app.post("/referenceBooks", (req, res) => {
    const type = req.body.type;
    const name = req.body.name;
    const code = req.body.code;
    const page = req.body.page;
    const elNum = req.body.elNum;

    let referenceBooks = models.map((el) => {
        return {
            type: el.type,
            name: el.name,
            code: el.code,
            dateFrom: el.dateFrom,
            dateTo: el.dateTo,
        };
    });

    if (type) {
        referenceBooks = referenceBooks.filter(
            (el) => el.type.toLowerCase() === type.toLowerCase()
        );
    }

    if (name) {
        referenceBooks = referenceBooks.filter(
            (el) => el.name.toLowerCase() === name.toLowerCase()
        );
    }

    if (code) {
        referenceBooks = referenceBooks.filter(
            (el) => el.code.toLowerCase() === code.toLowerCase()
        );
    }
    referenceBooks = referenceBooks.sort((a, b) =>
        a.code.localeCompare(b.code)
    );

    const startIndex = elNum === "all" ? 0 : page * elNum;
    const endIndex = elNum === "all" ? undefined : startIndex + elNum;

    const num = referenceBooks.length;

    referenceBooks = referenceBooks.slice(
        startIndex,
        elNum === "all"
            ? undefined
            : endIndex < referenceBooks.length
            ? endIndex
            : undefined
    );

    res.send({ referenceBooks, num });
});

app.post("/referenceBookCodes", async (req, res) => {
    const code = req.body.code;
    const model = models.find((el) => el.code === code);
    if (!model) {
        res.send(null);
        return;
    }
    const data = await getData(model);

    let newData = [];

    data.forEach((el) => {
        const newEl = {
            code: String(el.code),
            ru_name: el.ru_name,
            dateFrom: el.dateFrom,
            dateTo: el.dateTo,
        };
        newData.push(newEl);
    });

    const codes = newData.map((el) => el.code).sort((a, b) => a - b);
    res.send(codes);
});

app.post("/referenceBookNames", async (req, res) => {
    const name = req.body.name;
    const model = models.find((el) => el.name === name);
    if (!model) {
        res.send(null);
        return;
    }
    const data = await getData(model);
    const names = data.map((el) => el.ru_name).sort((a, b) => a - b);
    res.send(names);
});

app.post("/referenceBookData", async (req, res) => {
    const modelCode = req.body.modelCode;
    const name = req.body.name;
    const code = req.body.code;
    const dateFrom = req.body.dateFrom;
    const dateTo = req.body.dateTo;
    const page = req.body.page;
    const elNum = req.body.elNum;

    const model = models.find((el) => el.code === modelCode);

    if (!model) {
        res.send(null);
        return;
    }

    let data = await getData(model);

    let newData = [];

    data.forEach((el) => {
        const newEl = {
            code: String(el.code),
            ru_name: el.ru_name,
            dateFrom: el.dateFrom,
            dateTo: el.dateTo,
        };
        newData.push(newEl);
    });

    if (name) {
        newData = newData.filter(
            (el) => el.ru_name.toLowerCase() === name.toLowerCase()
        );
    }

    if (code) {
        newData = newData.filter(
            (el) => el.code.toLowerCase() === code.toLowerCase()
        );
    }

    if (dateFrom) {
        newData = newData.filter((el) => {
            return (
                Date.parse(
                    el.dateFrom.split(".").reverse().join("-") +
                        "T00:00:00.000Z"
                ) >=
                Date.parse(
                    dateFrom.split(".").reverse().join("-") + "T00:00:00.000Z"
                )
            );
        });
    }

    if (dateTo) {
        newData = newData.filter(
            (el) =>
                Date.parse(
                    el.dateTo.split(".").reverse().join("-") + "T00:00:00.000Z"
                ) <=
                Date.parse(
                    dateTo.split(".").reverse().join("-") + "T00:00:00.000Z"
                )
        );
    }

    const startIndex = elNum === "all" ? 0 : page * elNum;
    const endIndex = elNum === "all" ? undefined : startIndex + elNum;

    const num = newData.length;

    newData = newData.slice(
        startIndex,
        elNum === "all"
            ? undefined
            : endIndex < newData.length
            ? endIndex
            : undefined
    );

    newData = newData.sort((a, b) => a.code - b.code);

    res.send({ newData, num });
});
