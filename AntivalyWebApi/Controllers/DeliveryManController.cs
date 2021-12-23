using System;
using BLL;
using BEL;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using AntivalyWebApi.Auth;

namespace AntivalyWebApi.Controllers
{
    [EnableCors("*", "*", "*")]
    [CustomAuth]

    public class DeliveryManController : ApiController
    {
        [Route("api/deliveryman/profile/{uid}")]
        [HttpGet]
        public HttpResponseMessage Get(string uid)
        {
            var data = UserService.Get(uid);
            if (data != null)
                return Request.CreateResponse(HttpStatusCode.OK, data);
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Empty");
        }
        [Route("api/deliveryman/profile/edit")]
        [HttpPost]
        public HttpResponseMessage Edit(UserModel userModel)
        {
            UserService.Edit(userModel);
            if (userModel != null)
                return Request.CreateResponse(HttpStatusCode.OK, "Profile Has Been Edited");
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Edit Failed!");
        }
        [Route("api/deliveryman/profile/delete/{uid}")]
        [HttpPost]
        public HttpResponseMessage Delete(string uid)
        {
            UserService.Delete(uid);
            if (uid != null)
                return Request.CreateResponse(HttpStatusCode.OK, "Profile Has Been Deleted");
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Delete Failed!");
        }


    }
}
