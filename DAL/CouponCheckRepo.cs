using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class CouponCheckRepo : IRepository<CouponCheck, int>
    {
        AntivalyEntities db;

        public CouponCheckRepo(AntivalyEntities db)
        {
            this.db = db;
        }

        public void Add(CouponCheck e)
        {
            this.db.CouponChecks.Add(e);
            this.db.SaveChanges();
        }

        public void Delete(int id)
        {
            var couponCheck = db.CouponChecks.FirstOrDefault(c => c.Id == id);
            db.CouponChecks.Remove(couponCheck);
            db.SaveChanges();
        }

        public void Edit(CouponCheck e)
        {
            var u = db.CouponChecks.FirstOrDefault(en => en.Id == e.Id);
            db.Entry(u).CurrentValues.SetValues(e);
            db.SaveChanges();
        }

        public List<CouponCheck> Get()
        {
            return db.CouponChecks.ToList();
        }

        public CouponCheck Get(int id)
        {
            return db.CouponChecks.FirstOrDefault(en => en.Id == id);
        }
    }
}
