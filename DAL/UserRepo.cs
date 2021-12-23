using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class UserRepo : IRepository<User, string>
    {
        AntivalyEntities db;

        public UserRepo(AntivalyEntities db)
        {
            this.db = db;
        }

        public void Add(User e)
        {
            this.db.Users.Add(e);
            this.db.SaveChanges();
        }

        public void Delete(string id)
        {
            var user = db.Users.FirstOrDefault(c => c.UID == id);
            db.Users.Remove(user);
            db.SaveChanges();
        }

        public void Edit(User e)
        {
            var u = db.Users.FirstOrDefault(en => en.ID == e.ID);
            db.Entry(u).CurrentValues.SetValues(e);
            db.SaveChanges();
        }


        public List<User> Get()
        {
            return db.Users.ToList();
        }

        public User Get(string id)
        {
            return db.Users.FirstOrDefault(c => c.UID == id);
        }
    }
}
