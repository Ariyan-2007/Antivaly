using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class UserIdRepo : IRepository<UserID, int>
    {
        AntivalyEntities db;

        public UserIdRepo(AntivalyEntities db)
        {
            this.db = db;
        }

        public List<UserID> Get()
        {
            return db.UserIDs.ToList();
        }

        public UserID Get(int id)
        {
            return db.UserIDs.FirstOrDefault(c => c.ID == id);
        }

        public void Edit(UserID user)
        { 
            db.Entry(db.UserIDs.FirstOrDefault(u => u.ID == user.ID)).CurrentValues.SetValues(user);
        }

        public void Add(UserID e)
        {
            throw new NotImplementedException();
        }

        public void Delete(int id)
        {
            throw new NotImplementedException();
        }
    }
}
