const dayjs = require("dayjs");
const userAttendeeEntity = require("../entity/userAttendeeEntity");
const jwt = require("jsonwebtoken");
const ip = require("ip");
const axios = require("axios");

module.exports = userAttendee = {
    getAllAttendee: async (req, res) => {
        try {
            const response = await userAttendeeEntity.find({});
            res.status(200).send(response);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },
    register: async (req, res) => {
        try {
            const body = req.body;
            if (typeof body.identityNumber !== 'string') {
                return res.status(400).send({ message: "identityNumber must be string" });
            }

            const checkUser = await userAttendeeEntity.findOne({ identityNumber: body.identityNumber, emailAddress: body.emailAddress });
            if (checkUser) {
                return res.status(400).send({ message: "exist data" });
            }
            const dataBody = {
                identityNumber: body.identityNumber,
                emailAddress: body.emailAddress,
                username: body.username,
                checkIn: "",
                checkOut: "",
                ipAddress: "",
                longitude: "",
                latitude: ""
            }

            await userAttendeeEntity.create(dataBody);
            res.sendStatus(200);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },
    login: async (req, res) => {
        const body = req.body;
        const checkDataByIdNumber = await userAttendeeEntity.findOne({ identityNumber: body.identityNumber });
        if (!checkDataByIdNumber) return res.status(404).send({ message: "cannot find id" });
        const access_token = jwt.sign({
            emailAddress: checkDataByIdNumber.emailAddress,
            identityNumber: checkDataByIdNumber.identityNumber,
        }, process.env.TOKEN_KEY,
            { expiresIn: '1h' });

        res.status(200).send({ access_token });
    },
    attendee: async (req, res) => {
        try {
            const token = req.headers.authorization.split(' ')[1]
            const dataToken = jwt.decode(token)
            const checkDataByIdNumber = await userAttendeeEntity.findOne({ identityNumber: dataToken?.identityNumber });
            if (!checkDataByIdNumber) return res.status(404).send({ message: "cannot find id" });

            const URL = `https://ipgeolocation.abstractapi.com/v1/?api_key=${process.env.API_KEY}`;
            const ipAddress = ip.address();
            const apiResponse = await axios.get(URL + "& ip_address=" + ipAddress);
            checkDataByIdNumber.ipAddress = apiResponse.data.ip_address;
            checkDataByIdNumber.longitude = apiResponse.data.longitude;
            checkDataByIdNumber.latitude = apiResponse.data.latitude;

            const dateNow = dayjs().format("YYYY-MM-DD HH:mm:ss");
            const bodyAttend = {
                ipAddress: apiResponse.data.ip_address,
                longitude: apiResponse.data.longitude,
                latitude: apiResponse.data.latitude
            }
            if (!checkDataByIdNumber?.checkIn || !checkDataByIdNumber?.checkOut) {
                if (!checkDataByIdNumber?.checkIn) {
                    console.log("CHECKIN")
                    await userAttendeeEntity.findByIdAndUpdate(checkDataByIdNumber.id, { checkIn: dateNow, ipAddress: bodyAttend.ipAddress, longitude: bodyAttend.longitude, latitude: bodyAttend.latitude });
                } else {
                    console.log("CHECKOUT")
                    await userAttendeeEntity.findByIdAndUpdate(checkDataByIdNumber.id, { checkOut: dateNow, ipAddress: bodyAttend.ipAddress, longitude: bodyAttend.longitude, latitude: bodyAttend.latitude });
                }
            } else {
                const diffDate = dayjs().format("YYYY-MM-DD");
                const lastCheckIn = dayjs(checkDataByIdNumber?.checkIn).format("YYYY-MM-DD");
                if (diffDate > lastCheckIn) {
                    await userAttendeeEntity.findByIdAndUpdate(checkDataByIdNumber.id, { checkIn: dateNow, ipAddress: bodyAttend.ipAddress, longitude: bodyAttend.longitude, latitude: bodyAttend.latitude });
                } else if (checkDataByIdNumber?.checkIn) {
                    await userAttendeeEntity.findByIdAndUpdate(checkDataByIdNumber.id, { checkOut: dateNow, ipAddress: bodyAttend.ipAddress, longitude: bodyAttend.longitude, latitude: bodyAttend.latitude });
                }
            }
            const data = await userAttendeeEntity.findById(checkDataByIdNumber.id);
            res.status(200).send(data);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
}