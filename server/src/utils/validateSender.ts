const validateSender = (requestSender: string, messageSender: string) => {
    return requestSender && requestSender === messageSender;
  };
  
  export default validateSender;