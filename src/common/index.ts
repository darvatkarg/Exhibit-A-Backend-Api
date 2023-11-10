export class apiResponse {
    private status: number | null
    private message: string | null
    private data: any | null
    private error: any | null
    constructor(status: number, message: string, data: any, error: any) {
        this.status = status
        this.message = message
        this.data = data
        this.error = error
    }
}

export const not_first_one = (a1: Array<any>, a2: Array<any>) => {
    var a = [], diff = [];
    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }
    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        }
    }
    for (var k in a) {
        diff.push(k);
    }

    return diff;
}

export const URL_decode = (url) => {
    try {
        let folder_name = [], image_name
        url.split("/").map((value, index, arr) => {

            image_name = url.split("/")[url.split("/").length - 1]
            folder_name = (url.split("/"))
            folder_name.splice(url.split("/").length - 1, 1)
        })
        return [folder_name.join('/'), image_name]
    }
    catch (error) {
        console.log(error)
        return error
    }
}

export const loginStatus = {
    regular: 0,
    google: 1,
    facebook: 2,
    twitter: 3,
}

export const userStatus = {
    teacher: 0,
    admin: 1,
    student: 2,
    sub_admin: 3,
    auditor: 4,
    upload: 5,
    faculty: 6,
    school: 7,
}

export const readingStatus = {
    pending: 0,
    reading: 1,
    completed: 2
}

export const testType = {
    mcq: 0,
    theory: 1,
    computer: 2
}

export const topicType = {
    mcq: 0,
    theory: 1
}

export const bookType = {
    free: true,
    paid: false
}

export const orderType = {
    online: 0,
    physical: 1
}

export const orderStatus = {
    pending: 0,
    deliver: 1
}
export const trainingType = {
    recorded: 0,
    live: 1,
    physical: 2
}

export const EventNames = {
    roomCreated: 'room-created',
};
export const SMS_message = {
    OTP_verification: `KATon verification code: `,
    OTP_forgot_password: `KATon app forgot password verification code: `
}

export const image_folder = ['category', 'sub_category', 'main_category', 'profile_image', 'book', 'genre', 'school', 'ePub', 'pdf', 'audio', 'video', 'form_image']

export const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']