using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class AuthRepo : IAuth
    {
        AntivalyEntities db;

        public AuthRepo(AntivalyEntities db)
        {
            this.db = db;
        }

        public Token Authenticate(User user)
        {
            Token t = null;
            var u = db.Users.FirstOrDefault(e => e.UID == user.UID && e.Password == user.Password);
            if (u != null)
            {
                var r = new Random();
                var g = Guid.NewGuid();
                var token = g.ToString();

                t = new Token()
                {
                    UserID = u.UID,
                    AccStatus = u.AccStatus,
                    AccessToken = token,
                    CreatedAt = DateTime.Now

                };
                db.Tokens.Add(t);
                db.SaveChanges();

            }

            return t;

        }
        public bool IsAuthenticated(string token)
        {
            var ac_token = db.Tokens.FirstOrDefault(e => e.AccessToken.Equals(token) && e.ExpiredAt == null);
            if (ac_token != null) return true;
            return false;

        }

        public bool Logout(string id)
        {
            var data = db.Tokens.FirstOrDefault(e => e.UserID == id);
            if(data != null)
            {
                db.Tokens.Remove(data);
                db.SaveChanges();
                return true;
            }
            return false;
        }
    }
}
