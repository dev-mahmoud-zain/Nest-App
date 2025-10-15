import EventEmitter from 'node:events';
import Mail from 'nodemailer/lib/mailer/index.js';

import { confirmEmailTemplate,
     disableTwoStepVerificationTemplate,
      enableTwoStepVerificationTemplate,
       forgetPasswordTemplate,
        loginTwoStepVerificationTemplate,
         mentionNotificationTemplate,
          passwordChangedTemplate,
           updateEmailTemplate } from './email.template.js';
import { sendEmail } from './send.email.js';
import { InternalServerErrorException } from '@nestjs/common';
import { EmailEventsEnum } from 'src/common/enums';

export const emailEvent = new EventEmitter();

interface IEmailData extends Mail.Options {
    OTP_Code: string
}

interface IMentionedInPostData extends Mail.Options {
    postLink: string,
    mentionedBy: string
}

emailEvent.on(EmailEventsEnum.confirm_Email, async (data: IEmailData) => {
    try {
        data.html = await confirmEmailTemplate({ OTP_Code: data.OTP_Code });
        data.subject = "Confirm Your Email Address";
        await sendEmail(data);
    } catch (error) {
        console.log("Fail To Send Email", error);
        throw new InternalServerErrorException("Something Went Wrong")
    }

})

emailEvent.on(EmailEventsEnum.confirm_Updated_Email, async (data: IEmailData) => {
    try {
        data.html = await updateEmailTemplate({ OTP_Code: data.OTP_Code });
        data.subject = "Confirm Your Updated Email Address";
        await sendEmail(data);
    } catch (error) {
        console.log("Fail To Send Email", error);
        throw new InternalServerErrorException("Something Went Wrong")
    }

})

emailEvent.on(EmailEventsEnum.enable_2FA, async (data: IEmailData) => {
    try {
        data.html = await enableTwoStepVerificationTemplate({ OTP_Code: data.OTP_Code });
        data.subject = "Enable Two-Step Verification – Action Required";
        await sendEmail(data);
    } catch (error) {
        console.log("Fail To Send Email", error);
        throw new InternalServerErrorException("Something Went Wrong")
    }
})

emailEvent.on(EmailEventsEnum.disable_2FA, async (data: IEmailData) => {
    try {
        data.html = await disableTwoStepVerificationTemplate({ OTP_Code: data.OTP_Code });
        data.subject = "Disable Two-Step Verification – Confirmation Needed";
        await sendEmail(data);
    } catch (error) {
        console.log("Fail To Send Email", error);
        throw new InternalServerErrorException("Something Went Wrong")
    }
})

emailEvent.on(EmailEventsEnum.login_2FA, async (data: IEmailData) => {
    try {
        data.html = await loginTwoStepVerificationTemplate({ OTP_Code: data.OTP_Code });
        data.subject = "LinkSphere | Login Verification Code";
        await sendEmail(data);
    } catch (error) {
        console.log("Fail To Send Email", error);
        throw new InternalServerErrorException("Something Went Wrong")
    }
})

emailEvent.on(EmailEventsEnum.forget_Password, async (data: IEmailData) => {

    try {
        data.html = await forgetPasswordTemplate({ OTP_Code: data.OTP_Code });
        data.subject = "Forget Your Password?";
        await sendEmail(data);
    } catch (error) {
        console.log("Fail To Send Email", error);
        throw new InternalServerErrorException("Something Went Wrong")
    }

})

emailEvent.on(EmailEventsEnum.change_Password, async (data: IEmailData) => {

    try {
        data.html = await passwordChangedTemplate();
        data.subject = "Forget Your Password?";
        await sendEmail(data);
    } catch (error) {
        console.log("Fail To Send Email", error);
        throw new InternalServerErrorException("Something Went Wrong")
    }

})

emailEvent.on(EmailEventsEnum.mentioned_In_Post, async (data: IMentionedInPostData) => {

    try {
        data.html = await mentionNotificationTemplate(data.postLink, data.mentionedBy);
        data.subject = `${data.mentionedBy} Mentioned You In Post`;
        await sendEmail(data);
    } catch (error) {
        console.log("Fail To Send Email", error);
        throw new InternalServerErrorException("Something Went Wrong")
    }

})